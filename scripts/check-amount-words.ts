import assert from "node:assert/strict";

import { amountInWords } from "../src/demos/rentbook/lib/finance.ts";

const cases: Array<[number, string]> = [
  [100, "One naira only"],
  [2100, "Twenty-one naira only"],
  [10000, "One hundred naira only"],
  [10100, "One hundred one naira only"],
  [100000, "One thousand naira only"],
  [1234500, "Twelve thousand, three hundred forty-five naira only"],
  [35000000, "Three hundred fifty thousand naira only"],
  [180000000, "One million, eight hundred thousand naira only"],
  [420050050, "Four million, two hundred thousand, five hundred naira, fifty kobo only"],
  [50, "Fifty kobo only"],
];

for (const [amount, expected] of cases) {
  assert.equal(amountInWords(amount), expected);
}
assert.throws(() => amountInWords(0), /positive integer/);
console.log("Amount-in-words checks passed for naira, kobo and rejected zero.");
