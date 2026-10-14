import assert from "node:assert/strict";

import { buildReminderMessage, reminderTones } from "../src/demos/rentbook/lib/reminders.ts";
import { toInternationalNigerianNumber } from "../src/shared/config/contact.ts";

const values = {
  name: "Ayo & Co.",
  unit: "Penthouse 14, a deliberately long unit name for the waterfront annex",
  property: "Ọpọlọ Court",
  amount: "₦1,250,000",
  dueDate: "14 days ago",
  daysOverdue: 14,
};

for (const tone of reminderTones) {
  const message = buildReminderMessage(tone, values);
  assert.match(message, /Ayo & Co\./);
  assert.match(message, /Ọpọlọ Court/);
  assert.match(message, /waterfront annex/);
}
assert.equal(toInternationalNigerianNumber("not a phone"), null);
assert.equal(toInternationalNigerianNumber("0805 168 1996"), "2348051681996");
console.log(
  "Reminder checks passed for all tones, missing phones, long unit names and special characters.",
);
