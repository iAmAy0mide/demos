import { balanceForCharge, OVERPAYMENT_CREDIT_LIMIT } from "./finance";

import type { Payment, RentbookData } from "../types";

export type RentbookState = RentbookData & {
  selectedPropertyId: string | "all";
  isLoaded: boolean;
};
export type RentbookAction =
  | { type: "hydrate"; payload: RentbookData; selectedPropertyId?: string | "all" }
  | { type: "select_property"; propertyId: string | "all" }
  | { type: "record_payment"; payment: Payment }
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
    case "record_payment": {
      const chargeIds = new Set(state.charges.map((charge) => charge.id));
      if (
        action.payment.allocations.some(
          (allocation) => !chargeIds.has(allocation.chargeId) || allocation.amount <= 0,
        )
      ) {
        return state;
      }
      const allocated = action.payment.allocations.reduce(
        (total, allocation) => total + allocation.amount,
        0,
      );
      const expectedAmount = allocated + action.payment.creditAmount;
      if (Math.round(expectedAmount * 100) !== Math.round(action.payment.amount * 100)) {
        return state;
      }
      const valid = action.payment.allocations.every((allocation) => {
        const charge = state.charges.find((entry) => entry.id === allocation.chargeId);
        return (
          charge !== undefined &&
          allocation.amount <= balanceForCharge(charge, state.payments) + OVERPAYMENT_CREDIT_LIMIT
        );
      });
      const hasValidCredit =
        action.payment.creditAmount >= 0 &&
        (action.payment.creditAmount === 0 ||
          action.payment.creditAmount > OVERPAYMENT_CREDIT_LIMIT);
      return valid && hasValidCredit
        ? { ...state, payments: [action.payment, ...state.payments] }
        : state;
    }
  }
}
