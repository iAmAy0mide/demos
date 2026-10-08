export type WorkKind = "landing page" | "business site" | "custom tool";

export type Work = {
  id: "fieldhand" | "rentbook" | "sunreach" | "meridian" | "harmattan";
  name: string;
  route: `/work/${string}`;
  kind: WorkKind;
  description: string;
  brandColor: string;
  published: boolean;
  order: number;
};

export const works: readonly Work[] = [
  {
    id: "fieldhand",
    name: "Fieldhand",
    route: "/work/fieldhand",
    kind: "custom tool",
    description: "Dispatch clarity for field-service teams.",
    brandColor: "#b4fa4a",
    published: true,
    order: 1,
  },
  {
    id: "rentbook",
    name: "Rentbook",
    route: "/work/rentbook",
    kind: "custom tool",
    description: "A calmer ledger for Lagos property managers.",
    brandColor: "#0b6b4d",
    published: true,
    order: 2,
  },
  {
    id: "sunreach",
    name: "Sunreach Power",
    route: "/work/sunreach",
    kind: "landing page",
    description: "Solar lead capture built around personal savings.",
    brandColor: "#ffc400",
    published: true,
    order: 3,
  },
  {
    id: "meridian",
    name: "Meridian Freight",
    route: "/work/meridian",
    kind: "business site",
    description: "Freight confidence expressed as operational detail.",
    brandColor: "#e75731",
    published: true,
    order: 4,
  },
  {
    id: "harmattan",
    name: "Harmattan Coffee Co.",
    route: "/work/harmattan",
    kind: "business site",
    description: "A tactile subscription journey for a specialty roaster.",
    brandColor: "#a14f35",
    published: true,
    order: 5,
  },
];

export const publishedWorks = works
  .filter((work) => work.published)
  .sort((a, b) => a.order - b.order);
