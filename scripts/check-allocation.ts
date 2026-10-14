import { allocatePayment } from "../src/demos/rentbook/lib/finance.ts";

import type { Charge, Payment } from "../src/demos/rentbook/types.ts";

const charges: Charge[] = [
  charge("one", 1_000, "2026-01-01"),
  charge("two", 2_000, "2026-02-01"),
  charge("three", 3_000, "2026-03-01"),
];
const noPayments: Payment[] = [];

assertAllocation({
  label: "exact charge",
  result: allocatePayment(charges, noPayments, 1_000),
  amounts: [1_000],
  remainingBalance: 5_000,
  creditAmount: 0,
});
assertAllocation({
  label: "partial charge",
  result: allocatePayment(charges, noPayments, 750),
  amounts: [750],
  remainingBalance: 5_250,
  creditAmount: 0,
});
assertAllocation({
  label: "three charges oldest-first",
  result: allocatePayment(charges, noPayments, 4_500),
  amounts: [1_000, 2_000, 1_500],
  remainingBalance: 1_500,
  creditAmount: 0,
});
assertAllocation({
  label: "total outstanding",
  result: allocatePayment(charges, noPayments, 6_000),
  amounts: [1_000, 2_000, 3_000],
  remainingBalance: 0,
  creditAmount: 0,
});
assertAllocation({
  label: "overpayment credit",
  result: allocatePayment(charges, noPayments, 6_500),
  amounts: [1_000, 2_000, 3_000],
  remainingBalance: 0,
  creditAmount: 500,
});
assertThrows("zero rejected", () => allocatePayment(charges, noPayments, 0));
assertThrows("negative rejected", () => allocatePayment(charges, noPayments, -2));
assertAllocation({
  label: "kobo precision",
  result: allocatePayment([charge("kobo", 1.01, "2026-01-01")], noPayments, 1.01),
  amounts: [1.01],
  remainingBalance: 0,
  creditAmount: 0,
});
console.log("Allocation checks passed: 8 cases.");

function charge(id: string, amount: number, dueDate: string): Charge {
  return { id, amount, dueDate, leaseId: "lease", type: "rent", description: id };
}

function assertAllocation({
  label,
  result,
  amounts,
  remainingBalance,
  creditAmount,
}: {
  label: string;
  result: ReturnType<typeof allocatePayment>;
  amounts: number[];
  remainingBalance: number;
  creditAmount: number;
}) {
  const actual = result.allocations.map((allocation) => allocation.amount);
  if (
    JSON.stringify(actual) !== JSON.stringify(amounts) ||
    result.remainingBalance !== remainingBalance ||
    result.creditAmount !== creditAmount
  ) {
    throw new Error(`${label} failed: ${JSON.stringify(result)}`);
  }
}

function assertThrows(label: string, run: () => void) {
  try {
    run();
  } catch {
    return;
  }
  throw new Error(`${label} did not throw.`);
}
