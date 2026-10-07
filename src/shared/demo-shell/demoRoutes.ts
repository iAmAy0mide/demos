export const demoRouteIds = ["fieldhand", "sunreach", "meridian", "harmattan"] as const;

export type DemoRouteId = (typeof demoRouteIds)[number];

type DemoRoute = { name: string; path: `/work/${DemoRouteId}` };

export const demoRoutes: Record<DemoRouteId, DemoRoute> = {
  fieldhand: { name: "Fieldhand", path: "/work/fieldhand" },
  sunreach: { name: "Sunreach Power", path: "/work/sunreach" },
  meridian: { name: "Meridian Freight", path: "/work/meridian" },
  harmattan: { name: "Harmattan Coffee Co.", path: "/work/harmattan" },
};

export function getAdjacentDemo(currentDemo: DemoRouteId, direction: -1 | 1) {
  const currentIndex = demoRouteIds.indexOf(currentDemo);
  const adjacentIndex = (currentIndex + direction + demoRouteIds.length) % demoRouteIds.length;
  return demoRoutes[demoRouteIds[adjacentIndex]];
}
