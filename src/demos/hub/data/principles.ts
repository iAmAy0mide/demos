import type { Work } from "@/src/shared/works";

export const wireframeRegions = ["goal", "mechanic", "proof", "doubts", "form", "mobile"] as const;

export type WireframeRegion = (typeof wireframeRegions)[number];

export type Principle = {
  id: WireframeRegion;
  number: string;
  title: string;
  description: readonly [string, string];
  workId: Work["id"];
  href: string;
  linkLabel: string;
};

export const principles: readonly Principle[] = [
  {
    id: "goal",
    number: "01",
    title: "One goal per page",
    description: [
      "A page has to make its next move obvious before it tries to say everything.",
      "When the goal is singular, the copy, hierarchy and call to action can pull in the same direction.",
    ],
    workId: "sunreach",
    href: "/work/sunreach",
    linkLabel: "See the Sunreach enquiry path",
  },
  {
    id: "mechanic",
    number: "02",
    title: "Put the mechanic above the fold",
    description: [
      "Useful interaction gives a visitor a reason to stay before they are asked to commit.",
      "It should answer the question already in their head, not decorate the page.",
    ],
    workId: "sunreach",
    href: "/work/sunreach",
    linkLabel: "Try the Sunreach calculator",
  },
  {
    id: "proof",
    number: "03",
    title: "Show proof before promises",
    description: [
      "Specific evidence lets a buyer judge the work without taking a claim on trust.",
      "Operational detail is often stronger than another line of persuasion.",
    ],
    workId: "meridian",
    href: "/work/meridian/track",
    linkLabel: "Use Meridian’s tracker",
  },
  {
    id: "doubts",
    number: "04",
    title: "Answer doubts before they are asked",
    description: [
      "Questions left until the end become reasons to leave.",
      "Clear answers near the decision keep a visitor moving with less second-guessing.",
    ],
    workId: "harmattan",
    href: "/work/harmattan/subscribe",
    linkLabel: "Build a Harmattan box",
  },
  {
    id: "form",
    number: "05",
    title: "Remove friction from the form",
    description: [
      "Ask only for what makes the next conversation useful.",
      "The form should carry context forward, so a visitor does not have to repeat their decision.",
    ],
    workId: "rentbook",
    href: "/work/rentbook",
    linkLabel: "Record a Rentbook payment",
  },
  {
    id: "mobile",
    number: "06",
    title: "Make the path work on a phone",
    description: [
      "The small screen is not a reduced version of the journey; it is where many decisions begin.",
      "The core action needs to remain legible, reachable and complete without a workaround.",
    ],
    workId: "fieldhand",
    href: "/work/fieldhand",
    linkLabel: "Open Fieldhand’s dispatch flow",
  },
];
