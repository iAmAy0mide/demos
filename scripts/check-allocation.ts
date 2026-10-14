import { allocatePayment } from "../src/demos/rentbook/lib/finance.ts";

import type { Charge, Payment } from "../src/demos/rentbook/types.ts";

const charges: Charge[] = [
  charge("one", 1_000, "2026-01-01"),
  charge("two", 2_000, "2026-02-01"),
  charge("three", 3_000, "2026-03-01"),
];
const noPayments: Payment[] = [];

assertAllocation("exact charge", allocatePayment(charges, noPayments, 1_000), [1_000], 5_000, 0);
assertAllocation("partial charge", allocatePayment(charges, noPayments, 750), [750], 5_250, 0);
assertAllocation(
  "three charges oldest-first",
  allocatePayment(charges, noPayments, 4_500),
  [1_000, 2_000, 1_500],
  1_500,
  0,
);
assertAllocation(
  "total outstanding",
  allocatePayment(charges, noPayments, 6_000),
  [1_000, 2_000, 3_000],
  0,
  0,
);
assertAllocation(
  "overpayment credit",
  allocatePayment(charges, noPayments, 6_500),
  [1_000, 2_000, 3_000],
  0,
  500,
);
assertThrows("zero rejected", () => allocatePayment(charges, noPayments, 0));
assertThrows("negative rejected", () => allocatePayment(charges, noPayments, -2));
assertAllocation(
  "kobo precision",
  allocatePayment([charge("kobo", 1.01, "2026-01-01")], noPayments, 1.01),
  [1.01],
  0,
  0,
);
console.log("Allocation checks passed: 8 cases.");

function charge(id: string, amount: number, dueDate: string): Charge {
  return { id, amount, dueDate, leaseId: "lease", type: "rent", description: id };
}

function assertAllocation(
  label: string,
  result: ReturnType<typeof allocatePayment>,
  amounts: number[],
  remainingBalance: number,
  creditAmount: number,
) {
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
