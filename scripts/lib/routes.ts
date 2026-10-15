export type AuditDemo = "hub" | "fieldhand" | "sunreach" | "meridian" | "harmattan" | "rentbook";
export type AuditRouteKind = "marketing" | "app";

export type AuditRoute = {
  path: string;
  label: string;
  demo: AuditDemo;
  kind: AuditRouteKind;
  interactions: string[];
  expectedStatus?: 404;
};

const fieldhandInteractions = ["command palette", "assign picker", "create job"];
const fieldhandCommonInteractions = ["command palette"];
const harmattanInteractions = ["mobile menu", "bag drawer"];
const rentbookInteractions = ["command palette", "payment drawer"];
const rentbookPaymentInteractions = [...rentbookInteractions, "receipt"];

export const auditRoutes: AuditRoute[] = [
  { path: "/", label: "Hub", demo: "hub", kind: "marketing", interactions: [] },
  {
    path: "/work/fieldhand?job=VL-1042",
    label: "Fieldhand dispatch board",
    demo: "fieldhand",
    kind: "app",
    interactions: fieldhandInteractions,
  },
  {
    path: "/work/fieldhand/quotes",
    label: "Fieldhand quotes",
    demo: "fieldhand",
    kind: "app",
    interactions: fieldhandCommonInteractions,
  },
  {
    path: "/work/fieldhand/schedule?job=VL-1042",
    label: "Fieldhand schedule",
    demo: "fieldhand",
    kind: "app",
    interactions: fieldhandCommonInteractions,
  },
  {
    path: "/work/sunreach",
    label: "Sunreach home",
    demo: "sunreach",
    kind: "marketing",
    interactions: [],
  },
  {
    path: "/work/meridian",
    label: "Meridian home",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/about",
    label: "Meridian about",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/contact",
    label: "Meridian contact",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/quote",
    label: "Meridian quote",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/services",
    label: "Meridian services",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/services/sea-freight",
    label: "Meridian sea freight",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/services/air-freight",
    label: "Meridian air freight",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/services/road-freight",
    label: "Meridian road freight",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/services/customs-clearance",
    label: "Meridian customs clearance",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/services/warehousing",
    label: "Meridian warehousing",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/meridian/track",
    label: "Meridian tracking",
    demo: "meridian",
    kind: "marketing",
    interactions: ["mobile menu"],
  },
  {
    path: "/work/harmattan",
    label: "Harmattan home",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/cafes",
    label: "Harmattan cafes",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/coffees",
    label: "Harmattan coffees",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/coffees/mambilla-morning",
    label: "Harmattan Mambilla Morning",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/coffees/lekki-after-rain",
    label: "Harmattan Lekki After Rain",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/coffees/abuja-blue-hour",
    label: "Harmattan Abuja Blue Hour",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/coffees/ojota-night-drive",
    label: "Harmattan Ojota Night Drive",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/coffees/zaria-sun",
    label: "Harmattan Zaria Sun",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/coffees/harmattan-dust",
    label: "Harmattan Dust",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/journal",
    label: "Harmattan journal",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/journal/a-lagos-pour-over",
    label: "Harmattan Lagos pour-over",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/journal/why-taraba-tastes-like-honey",
    label: "Harmattan Taraba journal",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/roast-lab",
    label: "Harmattan roast lab",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/story",
    label: "Harmattan story",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/subscribe",
    label: "Harmattan subscription",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/harmattan/wholesale",
    label: "Harmattan wholesale",
    demo: "harmattan",
    kind: "marketing",
    interactions: harmattanInteractions,
  },
  {
    path: "/work/rentbook",
    label: "Rentbook overview",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/rentbook/maintenance",
    label: "Rentbook maintenance",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/rentbook/payments",
    label: "Rentbook payments",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookPaymentInteractions,
  },
  {
    path: "/work/rentbook/properties",
    label: "Rentbook properties",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/rentbook/properties/property-1",
    label: "Rentbook Admiralty Court",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/rentbook/rent-roll",
    label: "Rentbook rent roll",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/rentbook/reports",
    label: "Rentbook reports",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/rentbook/tenants",
    label: "Rentbook tenants",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/rentbook/tenants/tenant-1",
    label: "Rentbook Adaeze Okoro",
    demo: "rentbook",
    kind: "app",
    interactions: rentbookInteractions,
  },
  {
    path: "/work/meridian/not-an-route",
    label: "Meridian not found",
    demo: "meridian",
    kind: "marketing",
    interactions: [],
    expectedStatus: 404,
  },
  {
    path: "/work/harmattan/not-an-route",
    label: "Harmattan not found",
    demo: "harmattan",
    kind: "marketing",
    interactions: [],
    expectedStatus: 404,
  },
  {
    path: "/work/rentbook/tenants/not-a-tenant",
    label: "Rentbook not found",
    demo: "rentbook",
    kind: "app",
    interactions: [],
    expectedStatus: 404,
  },
  {
    path: "/audit-route-not-found",
    label: "Global not found",
    demo: "hub",
    kind: "marketing",
    interactions: [],
    expectedStatus: 404,
  },
];

export const appAuditRoutes = auditRoutes.filter((route) => route.demo !== "hub");

export function routesFromEnvironment(value: string | undefined, fallback: AuditRoute[]) {
  if (!value) {
    return fallback;
  }
  const paths = value.split(",").filter(Boolean);
  return paths.map((path) => ({
    path,
    label: path,
    demo: "hub",
    kind: "marketing",
    interactions: [],
  }));
}
