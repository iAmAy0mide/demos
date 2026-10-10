import type { Work } from "@/src/shared/works";

export type Service = {
  id: "landing-pages" | "business-websites" | "custom-tools";
  kind: string;
  name: string;
  promise: string;
  description: readonly [string, string];
  audience: string;
  deliverables: readonly string[];
  workIds: readonly Work["id"][];
};

export const services: readonly Service[] = [
  {
    id: "landing-pages",
    kind: "Landing page",
    name: "Landing pages",
    promise: "Make one clear offer easy to act on.",
    description: [
      "A focused sales page for a campaign, product or new offer.",
      "Every section earns its place by moving a visitor toward one decision.",
    ],
    audience: "Teams bringing a specific offer to market and needing a direct response path.",
    deliverables: [
      "A single-goal page built around one action",
      "A useful mechanic such as a calculator or booking step",
      "A lead form that works cleanly on a phone",
      "A measurement-ready structure for the campaign",
    ],
    workIds: ["sunreach"],
  },
  {
    id: "business-websites",
    kind: "Business website",
    name: "Business websites",
    promise: "Turn considered research into a confident enquiry.",
    description: [
      "A complete site for buyers who need to understand how your business works.",
      "It gives your strongest operational detail a clear place to do its job.",
    ],
    audience: "Businesses whose buyers compare expertise, process and fit before getting in touch.",
    deliverables: [
      "A clear information architecture for your offers",
      "Service and proof pages with useful detail",
      "A practical enquiry route from every key page",
      "A content foundation your team can extend",
    ],
    workIds: ["meridian", "harmattan"],
  },
  {
    id: "custom-tools",
    kind: "Custom internal tool",
    name: "Custom internal tools",
    promise: "Give a busy team one dependable place to act.",
    description: [
      "A working interface for the operations that do not belong in a spreadsheet or chat thread.",
      "The shape follows the decisions your team must make repeatedly.",
    ],
    audience: "Teams coordinating people, records or exceptions across a fast-moving workday.",
    deliverables: [
      "A task flow shaped around the real operational decision",
      "Clear states for assignments, records and follow-up",
      "Keyboard and mobile paths for the work in hand",
      "Mock data that makes the workflow immediately testable",
    ],
    workIds: ["fieldhand", "rentbook"],
  },
];
