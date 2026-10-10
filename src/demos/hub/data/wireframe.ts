import type { WireframeRegion } from "@/src/demos/hub/data/principles";

export const WIREFRAME_VIEWBOX = { width: 320, height: 480 } as const;

export type WireframeRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WireframeRegionDefinition = {
  rectangles: readonly WireframeRectangle[];
  anchor: readonly [number, number];
};

export const wireframeRegions: Record<WireframeRegion, WireframeRegionDefinition> = {
  // The closest centres are doubts/form: 70 viewBox units apart. At a 320px viewport
  // the 272px container maps that to 59.5 CSS px, leaving a 15.5px gap between 44px hits.
  goal: {
    rectangles: [
      { x: 14, y: 14, width: 292, height: 45 },
      { x: 34, y: 84, width: 150, height: 13 },
      { x: 34, y: 107, width: 190, height: 13 },
      { x: 34, y: 134, width: 78, height: 20 },
    ],
    anchor: [50, 90],
  },
  mechanic: {
    rectangles: [{ x: 34, y: 174, width: 252, height: 52 }],
    anchor: [270, 190],
  },
  proof: {
    rectangles: [{ x: 34, y: 244, width: 252, height: 28 }],
    anchor: [50, 258],
  },
  doubts: {
    rectangles: [
      { x: 34, y: 291, width: 252, height: 15 },
      { x: 34, y: 318, width: 252, height: 15 },
    ],
    anchor: [270, 306],
  },
  form: {
    rectangles: [{ x: 34, y: 354, width: 252, height: 48 }],
    anchor: [270, 376],
  },
  mobile: {
    rectangles: [{ x: 34, y: 421, width: 252, height: 25 }],
    anchor: [50, 433],
  },
};

export function toWireframePercent(point: readonly [number, number]) {
  return {
    left: `${(point[0] / WIREFRAME_VIEWBOX.width) * 100}%`,
    top: `${(point[1] / WIREFRAME_VIEWBOX.height) * 100}%`,
  };
}
