import type { Charge, Payment } from "../types";

export type LedgerRow = {
  id: string;
  date: string;
  kind: "charge" | "payment";
  description: string;
  debit: number;
  credit: number;
  balance: number;
  paymentId?: string;
};

/** Sort charges before payments on a shared day, matching a paper rent ledger. */
export function buildLedger(charges: Charge[], payments: Payment[]): LedgerRow[] {
  const entries = [
    ...charges.map((charge) => ({
      id: charge.id,
      date: charge.dueDate,
      kind: "charge" as const,
      description: charge.description,
      debit: charge.amount,
      credit: 0,
    })),
    ...payments.map((payment) => ({
      id: payment.id,
      date: payment.date,
      kind: "payment" as const,
      description: `Payment · ${payment.reference}`,
      debit: 0,
      credit: payment.amount,
      paymentId: payment.id,
    })),
  ].sort(compareLedgerEntries);
  let balance = 0;
  return entries.map((entry) => {
    balance += entry.debit - entry.credit;
    return { ...entry, balance };
  });
}

function compareLedgerEntries(
  first: Omit<LedgerRow, "balance">,
  second: Omit<LedgerRow, "balance">,
) {
  if (first.date !== second.date) {
    return first.date.localeCompare(second.date);
  }
  if (first.kind === second.kind) {
    return first.id.localeCompare(second.id);
  }
  return first.kind === "charge" ? -1 : 1;
}
