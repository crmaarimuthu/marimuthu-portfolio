import { describe, expect, it } from "vitest";
import { isPointBlocked, resolveWallCollisions, type CollisionWall } from "./collision";

const wall: CollisionWall = {
  id: "wall-1",
  bounds: { minX: -1, maxX: 1, minZ: -1, maxZ: 1 },
  active: true,
};

describe("resolveWallCollisions", () => {
  it("leaves a point untouched when far from any wall", () => {
    const result = resolveWallCollisions({ x: 10, z: 10 }, 0.35, [wall]);
    expect(result).toEqual({ x: 10, z: 10 });
  });

  it("pushes the player out along the shortest axis when overlapping a wall edge", () => {
    const result = resolveWallCollisions({ x: 1.1, z: 0 }, 0.35, [wall]);
    expect(result.x).toBeGreaterThan(1.3);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it("ignores inactive (open door) walls", () => {
    const openWall = { ...wall, active: false };
    const result = resolveWallCollisions({ x: 1.1, z: 0 }, 0.35, [openWall]);
    expect(result).toEqual({ x: 1.1, z: 0 });
  });

  it("resolves against multiple walls in sequence", () => {
    const wallB: CollisionWall = {
      id: "wall-2",
      bounds: { minX: 3, maxX: 5, minZ: -1, maxZ: 1 },
      active: true,
    };
    const result = resolveWallCollisions({ x: 1.1, z: 0 }, 0.35, [wall, wallB]);
    // Only overlaps wall (wallB is out of collision range at this radius).
    expect(result.x).toBeGreaterThan(1.3);
  });

  it("keeps the pushed point at exactly the collider radius from the wall edge", () => {
    const result = resolveWallCollisions({ x: 1.1, z: 0 }, 0.35, [wall]);
    expect(result.x - 1).toBeCloseTo(0.35, 5);
  });
});

describe("isPointBlocked", () => {
  it("is false when clear of every wall", () => {
    expect(isPointBlocked({ x: 10, z: 10 }, 0.35, [wall])).toBe(false);
  });

  it("is true when overlapping an active wall", () => {
    expect(isPointBlocked({ x: 1.1, z: 0 }, 0.35, [wall])).toBe(true);
  });

  it("is false when the overlapping wall is inactive", () => {
    expect(isPointBlocked({ x: 1.1, z: 0 }, 0.35, [{ ...wall, active: false }])).toBe(false);
  });
});
