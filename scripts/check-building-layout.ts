import { buildBuildingLayout } from "../src/demos/rentbook/lib/buildingLayout.ts";

const widths = [320, 360, 390, 412, 768, 1440];
const layout = buildBuildingLayout(Array.from({ length: 8 }, (_, index) => `unit-${index + 1}`));
for (const width of widths) {
  for (const unit of layout.units) {
    if (escapesViewBox(unit, layout.viewBox)) {
      throw new Error(`Unit ${unit.id} escapes viewBox at ${width}px.`);
    }
    if (width === 320 && (unit.width * width) / layout.viewBox.width < 44) {
      throw new Error(`Unit ${unit.id} lacks 44px hit width at ${width}px.`);
    }
  }
}
ensureNoOverlaps();
console.log("Building layout checks passed at 320, 360, 390, 412, 768 and 1440px.");

function escapesViewBox(unit: (typeof layout.units)[number], viewBox: typeof layout.viewBox) {
  return (
    unit.x < 0 ||
    unit.y < 0 ||
    unit.x + unit.width > viewBox.width ||
    unit.y + unit.height > viewBox.height
  );
}

function unitsOverlap(first: (typeof layout.units)[number], second: (typeof layout.units)[number]) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function ensureNoOverlaps() {
  for (let index = 0; index < layout.units.length; index += 1) {
    const first = layout.units[index];
    const overlap = layout.units.slice(index + 1).find((second) => unitsOverlap(first, second));
    if (overlap) {
      throw new Error(`Units ${first.id} and ${overlap.id} overlap.`);
    }
  }
}
