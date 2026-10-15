export type BuildingUnitLayout = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type BuildingLayout = {
  viewBox: { width: number; height: number };
  units: BuildingUnitLayout[];
  entrance: { x: number; y: number; width: number; height: number };
};

const VIEWBOX_WIDTH = 800;
const SIDE = 56;
const GAP = 14;
const UNIT_WIDTH = 150;
const UNIT_HEIGHT = 78;

/** A single grid keeps the SVG's visible rooms and clickable geometry inseparable. */
export function buildBuildingLayout(unitIds: string[]): BuildingLayout {
  const columns = Math.min(4, Math.max(1, unitIds.length));
  const rows = Math.ceil(unitIds.length / columns);
  const gridWidth = columns * UNIT_WIDTH + (columns - 1) * GAP;
  const width = Math.max(VIEWBOX_WIDTH, gridWidth + SIDE * 2);
  const units = unitIds.map((id, index) => ({
    id,
    x: (width - gridWidth) / 2 + (index % columns) * (UNIT_WIDTH + GAP),
    y: 82 + Math.floor(index / columns) * (UNIT_HEIGHT + GAP),
    width: UNIT_WIDTH,
    height: UNIT_HEIGHT,
  }));
  const height = 82 + rows * (UNIT_HEIGHT + GAP) + 110;
  return {
    viewBox: { width, height },
    units,
    entrance: { x: width / 2 - 46, y: height - 88, width: 92, height: 88 },
  };
}
