import assert from "node:assert/strict";

import { buildWhatsAppLink } from "../src/shared/config/contact.ts";

const expectedBase = "https://wa.me/2348051681996?text=";
const messages = [undefined, "A message with spaces", "Fees & timing? ₦"];

for (const message of messages) {
  assert.equal(buildWhatsAppLink(message), `${expectedBase}${encodeURIComponent(message ?? "")}`);
}

console.log(
  "Contact link checks passed for empty, spaces, ampersand, question mark and Naira messages.",
);
