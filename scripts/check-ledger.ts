import { buildLedger } from "../src/demos/rentbook/lib/ledger.ts";

import type { Charge, Payment } from "../src/demos/rentbook/types.ts";

const charge = (id: string, amount: number, dueDate: string): Charge => ({
  id,
  amount,
  dueDate,
  leaseId: "lease-1",
  type: "rent",
  description: id,
});
const payment = (id: string, amount: number, date: string): Payment => ({
  id,
  amount,
  date,
  tenantId: "tenant-1",
  method: "cash",
  reference: id,
  allocations: [],
  notes: "",
  creditAmount: 0,
});
function expect(value: unknown, message: string) {
  if (!value) {
    throw new Error(message);
  }
}

expect(buildLedger([], []).length === 0, "Empty ledger should have no rows.");
const paid = buildLedger([charge("c1", 100, "2026-01-01")], [payment("p1", 100, "2026-01-02")]);
expect(paid.at(-1)?.balance === 0, "Fully paid account should close at zero.");
const partial = buildLedger([charge("c1", 100, "2026-01-01")], [payment("p1", 40, "2026-01-02")]);
expect(partial.at(-1)?.balance === 60, "Partial payment should retain balance.");
const credit = buildLedger([charge("c1", 100, "2026-01-01")], [payment("p1", 130, "2026-01-02")]);
expect(credit.at(-1)?.balance === -30, "Overpayment should show a credit balance.");
const sameDay = buildLedger([charge("c1", 100, "2026-01-01")], [payment("p1", 100, "2026-01-01")]);
expect(
  sameDay.map((row) => row.kind).join(",") === "charge,payment",
  "Same-day charges must precede payments.",
);
console.log("Ledger checks passed: empty, paid, partial, credit and same-day ordering.");
