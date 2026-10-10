import assert from "node:assert/strict";

import { BRIEF_MESSAGE_LIMIT, buildBriefMessage } from "../src/demos/hub/lib/briefMessage.ts";

const message = buildBriefMessage({
  name: "Ada & Co? #1",
  businessName: "₦ Studio",
  projectType: "Landing page",
  inspiration: [],
  visitorAction: "Make a considered enquiry about a new website.",
  startTiming: "",
  link: "",
});
assert.ok(!message.includes("Like:"));
assert.ok(message.includes("₦ Studio"));
assert.ok(
  buildBriefMessage({
    name: "A",
    businessName: "B",
    projectType: "Not sure",
    inspiration: ["Fieldhand"],
    visitorAction: "x".repeat(500),
    startTiming: "Next month",
    link: "https://example.com/?a=1&b=2#brief",
  }).length <= BRIEF_MESSAGE_LIMIT,
);
console.log("Brief message checks passed for optional fields, long text and special characters.");
