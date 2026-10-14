import assert from "node:assert/strict";

import {
  buildWhatsAppLink,
  buildWhatsAppLinkTo,
  toInternationalNigerianNumber,
} from "../src/shared/config/contact.ts";

const expectedBase = "https://wa.me/2348051681996?text=";
const messages = [undefined, "A message with spaces", "Fees & timing? ₦ #receipt"];

for (const message of messages) {
  assert.equal(buildWhatsAppLink(message), `${expectedBase}${encodeURIComponent(message ?? "")}`);
}

assert.equal(
  buildWhatsAppLinkTo("2348012345678", "Paid ₦1,200 & settled? #yes"),
  "https://wa.me/2348012345678?text=Paid%20%E2%82%A61%2C200%20%26%20settled%3F%20%23yes",
);
assert.equal(toInternationalNigerianNumber("0801 234 5678"), "2348012345678");
assert.equal(toInternationalNigerianNumber("+234 801 234 5678"), "2348012345678");
assert.equal(toInternationalNigerianNumber("801 234 5678"), "2348012345678");
assert.equal(toInternationalNigerianNumber("+1 555 555 5555"), null);

console.log(
  "Contact link checks passed for empty, spaces, ampersand, question mark and Naira messages.",
);
