import { buildCsv } from "../src/demos/rentbook/lib/buildCsv.ts";

const csv = buildCsv(
  ["name", "note", "amount", "date"],
  [
    { name: "Okoro, Ada", note: 'Said "paid"\nby transfer', amount: 12500000, date: "2026-10-15" },
    { name: "", note: "", amount: 0, date: "" },
  ],
);
const expected =
  '\uFEFFname,note,amount,date\r\n"Okoro, Ada","Said ""paid""\nby transfer",12500000,2026-10-15\r\n,,0,\r\n';
if (csv !== expected) {
  throw new Error("CSV escaping or BOM output differs from the RFC 4180 fixture.");
}
console.log("CSV checks passed: comma, quote, newline, empty field and large amount.");
