import type { AABB2D } from "./officeLayout";

export interface CollisionWall {
  id: string;
  bounds: AABB2D;
  /** False while this wall segment should not block movement (e.g. an open door gap). */
  active: boolean;
}

export interface PlanarPoint {
  x: number;
  z: number;
}

/**
 * Simplified circle-vs-AABB collision: treats the player as a circle of
 * `radius` and pushes it out of any overlapping active wall along the
 * axis of least penetration. This intentionally trades full mesh
 * collision for a cheap, predictable, and easily unit-tested resolver —
 * see docs/OFFICE_WORLD.md "Known limitations".
 */
export function resolveWallCollisions(
  point: PlanarPoint,
  radius: number,
  walls: CollisionWall[],
): PlanarPoint {
  let { x, z } = point;

  for (const wall of walls) {
    if (!wall.active) continue;
    const { minX, maxX, minZ, maxZ } = wall.bounds;

    const closestX = clamp(x, minX, maxX);
    const closestZ = clamp(z, minZ, maxZ);
    const dx = x - closestX;
    const dz = z - closestZ;
    const distanceSq = dx * dx + dz * dz;

    if (distanceSq >= radius * radius) continue;

    if (distanceSq > 1e-8) {
      const distance = Math.sqrt(distanceSq);
      const push = radius - distance;
      x += (dx / distance) * push;
      z += (dz / distance) * push;
    } else {
      // Center is exactly on the boundary/inside; push out along the
      // shallowest axis to avoid a zero-length normal.
      const penetrationX = Math.min(x - minX, maxX - x);
      const penetrationZ = Math.min(z - minZ, maxZ - z);
      if (penetrationX < penetrationZ) {
        x = x - minX < maxX - x ? minX - radius : maxX + radius;
      } else {
        z = z - minZ < maxZ - z ? minZ - radius : maxZ + radius;
      }
    }
  }

  return { x, z };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** True if a point overlaps any active wall within `radius` (used to reject standing up into a wall/desk). */
export function isPointBlocked(point: PlanarPoint, radius: number, walls: CollisionWall[]): boolean {
  const resolved = resolveWallCollisions(point, radius, walls);
  const dx = resolved.x - point.x;
  const dz = resolved.z - point.z;
  return Math.hypot(dx, dz) > 1e-6;
}
