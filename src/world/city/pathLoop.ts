/**
 * Closed polyline loop helper used by traffic vehicles and pedestrians:
 * given a distance travelled along the loop's perimeter, returns the
 * world position and the heading of the direction of travel. Pure and
 * unit-tested (see pathLoop.test.ts) — no three.js dependency.
 */

export interface LoopPoint {
  x: number;
  z: number;
}

export interface LoopPose {
  x: number;
  z: number;
  /** Yaw in radians, same convention as PlayerTransform (forward = (sin h, cos h)). */
  heading: number;
}

export function loopPerimeter(points: LoopPoint[]): number {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    total += Math.hypot(b.x - a.x, b.z - a.z);
  }
  return total;
}

export function advanceAlongLoop(points: LoopPoint[], distance: number): LoopPose {
  if (points.length === 0) {
    return { x: 0, z: 0, heading: 0 };
  }
  if (points.length === 1) {
    return { x: points[0].x, z: points[0].z, heading: 0 };
  }

  const perimeter = loopPerimeter(points);
  let remaining = ((distance % perimeter) + perimeter) % perimeter;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const segment = Math.hypot(b.x - a.x, b.z - a.z);
    if (remaining <= segment || i === points.length - 1) {
      const t = segment === 0 ? 0 : remaining / segment;
      return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        heading: Math.atan2(b.x - a.x, b.z - a.z),
      };
    }
    remaining -= segment;
  }

  return { x: points[0].x, z: points[0].z, heading: 0 };
}
