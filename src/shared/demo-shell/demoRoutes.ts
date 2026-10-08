import { publishedWorks, type Work } from "@/src/shared/works";

export type DemoRouteId = Work["id"];

export function getWorkPosition(currentDemo: DemoRouteId) {
  return publishedWorks.findIndex((work) => work.id === currentDemo) + 1;
}

export function getCurrentWork(currentDemo: DemoRouteId) {
  const work = publishedWorks.find((item) => item.id === currentDemo);
  if (!work) {
    throw new Error(`Missing published work entry for ${currentDemo}.`);
  }
  return work;
}

export function getNextWork(currentDemo: DemoRouteId) {
  const currentIndex = publishedWorks.findIndex((work) => work.id === currentDemo);
  return publishedWorks[(currentIndex + 1) % publishedWorks.length];
}
