import { balanceForCharge, OVERPAYMENT_CREDIT_LIMIT } from "./finance";

import type { MaintenanceRequest, Payment, Receipt, RentbookData, Unit } from "../types";

export type RentbookState = RentbookData & {
  selectedPropertyId: string | "all";
  isLoaded: boolean;
  maintenanceError: string | null;
};
export type RentbookAction =
  | { type: "hydrate"; payload: RentbookData; selectedPropertyId?: string | "all" }
  | { type: "select_property"; propertyId: string | "all" }
  | { type: "record_payment"; payment: Payment }
  | { type: "log_reminder"; tenantId: string; tone: string; date: string }
  | { type: "add_note"; tenantId: string; note: string; date: string }
  | { type: "add_maintenance"; request: MaintenanceRequest }
  | { type: "update_maintenance"; request: MaintenanceRequest }
  | { type: "reset"; payload: RentbookData };
export const initialRentbookState: RentbookState = {
  properties: [],
  units: [],
  tenants: [],
  leases: [],
  charges: [],
  payments: [],
  receipts: [],
  expenses: [],
  maintenance: [],
  activity: [],
  selectedPropertyId: "all",
  isLoaded: false,
  maintenanceError: null,
};
export function rentbookReducer(state: RentbookState, action: RentbookAction): RentbookState {
  switch (action.type) {
    case "hydrate":
      return {
        ...action.payload,
        selectedPropertyId: action.selectedPropertyId ?? "all",
        isLoaded: true,
        maintenanceError: null,
      };
    case "select_property":
      return { ...state, selectedPropertyId: action.propertyId };
    case "reset":
      return {
        ...action.payload,
        selectedPropertyId: "all",
        isLoaded: true,
        maintenanceError: null,
      };
    case "record_payment":
      return recordPayment(state, action.payment);
    case "log_reminder":
      return {
        ...state,
        activity: [
          {
            id: `activity-${state.activity.length + 1}`,
            tenantId: action.tenantId,
            date: action.date,
            message: `${action.tone} rent reminder sent by WhatsApp.`,
          },
          ...state.activity,
        ],
      };
    case "add_note":
      return {
        ...state,
        activity: [
          {
            id: `activity-${state.activity.length + 1}`,
            tenantId: action.tenantId,
            date: action.date,
            message: `Note: ${action.note}`,
          },
          ...state.activity,
        ],
      };
    case "add_maintenance":
      if (!state.units.some((unit) => unit.id === action.request.unitId)) {
        return { ...state, maintenanceError: "Choose a valid unit before creating this request." };
      }
      return {
        ...state,
        maintenance: [action.request, ...state.maintenance],
        maintenanceError: null,
      };
    case "update_maintenance":
      return updateMaintenance(state, action.request);
  }
}

const MAINTENANCE_STATUSES = ["reported", "assigned", "in_progress", "done"] as const;

function updateMaintenance(state: RentbookState, nextRequest: MaintenanceRequest): RentbookState {
  const previousRequest = state.maintenance.find((request) => request.id === nextRequest.id);
  if (!previousRequest) {
    return { ...state, maintenanceError: "This request no longer exists." };
  }
  if (!state.units.some((unit) => unit.id === nextRequest.unitId)) {
    return { ...state, maintenanceError: "Choose a valid unit before saving this request." };
  }
  if (!isAdjacentStatusMove(previousRequest.status, nextRequest.status)) {
    return {
      ...state,
      maintenanceError: "Move a maintenance request one status step at a time.",
    };
  }
  return {
    ...state,
    maintenance: state.maintenance.map((request) =>
      request.id === nextRequest.id
        ? withMaintenanceActivity(previousRequest, nextRequest)
        : request,
    ),
    units: updateUnitMaintenanceStatus(state.units, previousRequest, nextRequest),
    maintenanceError: null,
  };
}

function isAdjacentStatusMove(
  previous: MaintenanceRequest["status"],
  next: MaintenanceRequest["status"],
) {
  return Math.abs(MAINTENANCE_STATUSES.indexOf(previous) - MAINTENANCE_STATUSES.indexOf(next)) <= 1;
}

function withMaintenanceActivity(previous: MaintenanceRequest, next: MaintenanceRequest) {
  if (previous.status === next.status) {
    return next;
  }
  const date = new Date().toISOString().slice(0, 10);
  return {
    ...next,
    activity: [
      ...(previous.activity ?? []),
      {
        id: `maintenance-activity-${previous.id}-${next.status}`,
        date,
        message: `Status moved from ${previous.status.replace("_", " ")} to ${next.status.replace("_", " ")}.`,
      },
    ],
  };
}

function updateUnitMaintenanceStatus(
  units: Unit[],
  previous: MaintenanceRequest,
  next: MaintenanceRequest,
) {
  if (previous.status === next.status) {
    return units;
  }
  return units.map((unit): Unit => {
    if (unit.id !== next.unitId) {
      return unit;
    }
    if (next.status === "in_progress" && unit.status === "vacant") {
      return { ...unit, status: "under_maintenance" };
    }
    if (previous.status === "in_progress" && unit.status === "under_maintenance") {
      return { ...unit, status: "vacant" };
    }
    return unit;
  });
}

function recordPayment(state: RentbookState, payment: Payment): RentbookState {
  if (!hasKnownPositiveAllocations(state, payment) || !matchesPaymentTotal(payment)) {
    return state;
  }
  if (!allocationsFitBalances(state, payment) || !hasValidCredit(payment)) {
    return state;
  }
  return {
    ...state,
    payments: [payment, ...state.payments],
    receipts: [nextReceipt(state.receipts, payment), ...state.receipts],
  };
}

function hasKnownPositiveAllocations(state: RentbookState, payment: Payment) {
  const chargeIds = new Set(state.charges.map((charge) => charge.id));
  return payment.allocations.every(
    (allocation) => chargeIds.has(allocation.chargeId) && allocation.amount > 0,
  );
}

function matchesPaymentTotal(payment: Payment) {
  const allocated = payment.allocations.reduce((total, allocation) => total + allocation.amount, 0);
  return Math.round((allocated + payment.creditAmount) * 100) === Math.round(payment.amount * 100);
}

function allocationsFitBalances(state: RentbookState, payment: Payment) {
  return payment.allocations.every((allocation) => {
    const charge = state.charges.find((entry) => entry.id === allocation.chargeId);
    if (!charge) {
      return false;
    }
    return allocation.amount <= balanceForCharge(charge, state.payments) + OVERPAYMENT_CREDIT_LIMIT;
  });
}

function hasValidCredit(payment: Payment) {
  return (
    payment.creditAmount >= 0 &&
    (payment.creditAmount === 0 || payment.creditAmount > OVERPAYMENT_CREDIT_LIMIT)
  );
}

function nextReceipt(receipts: Receipt[], payment: Payment): Receipt {
  const highest = receipts.reduce((maximum, receipt) => {
    const sequence = Number(receipt.number.match(/(\d{4})$/)?.[1] ?? 0);
    return Math.max(maximum, sequence);
  }, 0);
  const year = payment.date.slice(0, 4);
  return {
    id: `receipt-${payment.id}`,
    paymentId: payment.id,
    issuedDate: payment.date,
    number: `RC-${year}-${String(highest + 1).padStart(4, "0")}`,
  };
}
