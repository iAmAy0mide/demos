import { strict as assert } from "node:assert";

import { suggestSlot } from "../src/demos/fieldhand/lib/suggestSlot.ts";

const day = new Date("2026-10-09T00:00:00.000Z");
const job = (start: string, durationMinutes: number) =>
  ({ scheduledStart: start, durationMinutes }) as never;

assert.equal(
  suggestSlot({ technicianJobs: [], durationMinutes: 90, day }).start,
  "2026-10-09T07:00:00.000Z",
);
assert.equal(
  suggestSlot({
    technicianJobs: [job("2026-10-09T08:00:00.000Z", 60)],
    durationMinutes: 90,
    day,
  }).start,
  "2026-10-09T09:00:00.000Z",
);
assert.equal(
  suggestSlot({
    technicianJobs: [job("2026-10-09T08:00:00.000Z", 30), job("2026-10-09T09:00:00.000Z", 60)],
    durationMinutes: 45,
    day,
  }).start,
  "2026-10-09T07:00:00.000Z",
);
assert.equal(
  suggestSlot({ technicianJobs: [job("2026-10-09T07:00:00.000Z", 600)], durationMinutes: 30, day })
    .start,
  null,
);
console.log("slot checks: pass");
