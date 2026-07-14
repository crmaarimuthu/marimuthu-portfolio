import { describe, expect, it } from "vitest";
import { advanceAlongLoop, loopPerimeter, type LoopPoint } from "./pathLoop";

const SQUARE: LoopPoint[] = [
  { x: 0, z: 0 },
  { x: 10, z: 0 },
  { x: 10, z: 10 },
  { x: 0, z: 10 },
];

describe("loopPerimeter", () => {
  it("sums all segments including the closing edge", () => {
    expect(loopPerimeter(SQUARE)).toBe(40);
  });
});

describe("advanceAlongLoop", () => {
  it("returns the start point at distance 0", () => {
    const pose = advanceAlongLoop(SQUARE, 0);
    expect(pose.x).toBeCloseTo(0);
    expect(pose.z).toBeCloseTo(0);
  });

  it("interpolates along the first segment with a heading facing travel", () => {
    const pose = advanceAlongLoop(SQUARE, 5);
    expect(pose.x).toBeCloseTo(5);
    expect(pose.z).toBeCloseTo(0);
    // Travelling toward +x → heading = atan2(1, 0) = π/2.
    expect(pose.heading).toBeCloseTo(Math.PI / 2);
  });

  it("crosses into later segments", () => {
    const pose = advanceAlongLoop(SQUARE, 15);
    expect(pose.x).toBeCloseTo(10);
    expect(pose.z).toBeCloseTo(5);
    expect(pose.heading).toBeCloseTo(0); // toward +z
  });

  it("wraps around the perimeter", () => {
    const pose = advanceAlongLoop(SQUARE, 45); // 40 + 5
    expect(pose.x).toBeCloseTo(5);
    expect(pose.z).toBeCloseTo(0);
  });

  it("handles negative distances by wrapping backwards", () => {
    const pose = advanceAlongLoop(SQUARE, -5);
    // -5 ≡ 35 → on the closing segment from (0,10) back to (0,0).
    expect(pose.x).toBeCloseTo(0);
    expect(pose.z).toBeCloseTo(5);
  });

  it("degenerate inputs do not crash", () => {
    expect(advanceAlongLoop([], 10)).toEqual({ x: 0, z: 0, heading: 0 });
    expect(advanceAlongLoop([{ x: 3, z: 4 }], 10)).toEqual({ x: 3, z: 4, heading: 0 });
  });
});
