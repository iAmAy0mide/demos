export const DESKTOP_POINT_COUNT = 220;
export const MOBILE_POINT_COUNT = 90;
export const CONNECTION_DISTANCE = 104;
export const POINTER_RADIUS = 180;
export const ACTION_RADIUS = 240;
export const POINT_RADIUS = 1.25;
export const MAX_PIXEL_RATIO = 2;

export type Point = { x: number; y: number; driftX: number; driftY: number; phase: number };
export type FieldTarget = { x: number; y: number; strength: number };

export function createPoints(count: number, width: number, height: number): Point[] {
  return Array.from({ length: count }, (_, index) => ({
    x: ((index * 47) % width) + 8,
    y: ((index * 83) % height) + 8,
    driftX: 0.18 + ((index * 13) % 17) / 90,
    driftY: 0.14 + ((index * 7) % 19) / 100,
    phase: (index * 0.618) % (Math.PI * 2),
  }));
}

/** The field combines tiny orbital drift with inverse-distance pulls; the CTA pull is persistent so attention visibly resolves into action. */
export function advancePoints(
  points: Point[],
  elapsed: number,
  width: number,
  height: number,
  pointer: FieldTarget | null,
  action: FieldTarget,
) {
  for (const point of points) {
    applyDrift(point, elapsed, width, height);
    applyPull(point, action, ACTION_RADIUS);
    if (pointer) {
      applyPull(point, pointer, POINTER_RADIUS);
    }
  }
}

function applyDrift(point: Point, elapsed: number, width: number, height: number) {
  point.x += Math.sin(elapsed * point.driftX + point.phase) * 0.24;
  point.y += Math.cos(elapsed * point.driftY + point.phase) * 0.2;
  if (point.x < 0) {
    point.x += width;
  }
  if (point.x > width) {
    point.x -= width;
  }
  if (point.y < 0) {
    point.y += height;
  }
  if (point.y > height) {
    point.y -= height;
  }
}

function applyPull(point: Point, target: FieldTarget, radius: number) {
  const xDistance = target.x - point.x;
  const yDistance = target.y - point.y;
  const distance = Math.hypot(xDistance, yDistance);
  if (distance === 0 || distance > radius) {
    return;
  }
  const pull = (1 - distance / radius) * target.strength;
  point.x += (xDistance / distance) * pull;
  point.y += (yDistance / distance) * pull;
}
