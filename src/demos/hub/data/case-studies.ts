import type { Work } from "@/src/shared/works";

export type CaseStudy = {
  clientType: string;
  problem: string;
  whatWeBuilt: string;
  whatToNotice: readonly string[];
  whyItConverts: string;
};

export const caseStudies: Record<Work["id"], CaseStudy> = {
  fieldhand: {
    clientType: "For service teams with moving parts",
    problem:
      "Dispatch breaks down when jobs, technicians and field updates live in different places.",
    whatWeBuilt:
      "A keyboard-friendly dispatch board that keeps assignment, travel and completion in one operational view.",
    whatToNotice: [
      "Drag a job between stages.",
      "Press Ctrl K to find work fast.",
      "Watch field updates arrive on the board.",
    ],
    whyItConverts: "The first useful action is visible before the interface explains itself.",
  },
  rentbook: {
    clientType: "For landlords and estate managers",
    problem:
      "Rent follow-up gets unreliable when a portfolio is spread across notebooks, transfers and chats.",
    whatWeBuilt:
      "A property-aware rent roll, printable receipts and a building view that makes the next collection or care decision obvious.",
    whatToNotice: [
      "Press P to record a payment.",
      "Print a receipt after recording it.",
      "Open a building to inspect every unit at a glance.",
    ],
    whyItConverts: "It leads with the cash position and lets a manager act from the same screen.",
  },
  sunreach: {
    clientType: "For energy businesses that need qualified enquiries",
    problem:
      "A solar enquiry form asks for commitment before a homeowner can see a reason to continue.",
    whatWeBuilt:
      "A savings calculator whose result carries straight into a practical site-inspection booking flow.",
    whatToNotice: [
      "Move the calculator inputs.",
      "Watch the system recommendation update.",
      "Carry those numbers into the booking form.",
    ],
    whyItConverts:
      "The visitor reaches a personal estimate before the form asks for their details.",
  },
  meridian: {
    clientType: "For B2B firms selling operational confidence",
    problem:
      "Freight buyers need proof that a supplier can handle exceptions, not a vague promise of reliability.",
    whatWeBuilt:
      "A route-led business site with service detail, quote paths and a working shipment tracker.",
    whatToNotice: [
      "Hover a route to read its operational context.",
      "Track MRD-10482.",
      "Use the quote flow like a buyer would.",
    ],
    whyItConverts:
      "Specific operational detail gives the buyer a concrete next step: track or request a quote.",
  },
  harmattan: {
    clientType: "For product brands with a point of view",
    problem:
      "A coffee subscription can feel abstract until the buyer can shape what will arrive at their door.",
    whatWeBuilt:
      "A warm, tactile shop experience with a box builder and roast controls that invite exploration.",
    whatToNotice: [
      "Build a box around your routine.",
      "Drag the roast slider.",
      "Browse coffees without losing the subscription thread.",
    ],
    whyItConverts:
      "Product choice feels physical and personal before the subscription asks for commitment.",
  },
};
