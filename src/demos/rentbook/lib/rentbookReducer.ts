import { balanceForCharge, OVERPAYMENT_CREDIT_LIMIT } from "./finance";

import type { MaintenanceRequest, Payment, Receipt, RentbookData } from "../types";

export type RentbookState = RentbookData & {
  selectedPropertyId: string | "all";
  isLoaded: boolean;
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
};
export function rentbookReducer(state: RentbookState, action: RentbookAction): RentbookState {
  switch (action.type) {
    case "hydrate":
      return {
        ...action.payload,
        selectedPropertyId: action.selectedPropertyId ?? "all",
        isLoaded: true,
      };
    case "select_property":
      return { ...state, selectedPropertyId: action.propertyId };
    case "reset":
      return { ...action.payload, selectedPropertyId: "all", isLoaded: true };
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
      return { ...state, maintenance: [action.request, ...state.maintenance] };
    case "update_maintenance":
      return {
        ...state,
        maintenance: state.maintenance.map((request) =>
          request.id === action.request.id ? action.request : request,
        ),
      };
  }
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
