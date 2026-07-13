import { describe, expect, it } from "vitest";
import { normalizeJoystickDelta } from "./joystickMath";

describe("normalizeJoystickDelta", () => {
  it("returns zero vector within the dead zone", () => {
    const v = normalizeJoystickDelta(2, 2, 50);
    expect(v).toEqual({ x: 0, y: 0 });
  });

  it("returns non-zero output just outside the dead zone", () => {
    const v = normalizeJoystickDelta(10, 0, 50);
    expect(v.x).toBeGreaterThan(0);
  });

  it("clamps output magnitude to at most 1 beyond max radius", () => {
    const v = normalizeJoystickDelta(500, 0, 50);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1, 5);
  });

  it("maps upward pointer movement (negative screen dy) to positive y (forward)", () => {
    const v = normalizeJoystickDelta(0, -40, 50);
    expect(v.y).toBeGreaterThan(0);
  });

  it("maps downward pointer movement (positive screen dy) to negative y (backward)", () => {
    const v = normalizeJoystickDelta(0, 40, 50);
    expect(v.y).toBeLessThan(0);
  });

  it("produces a full-scale unit vector at exactly max radius", () => {
    const v = normalizeJoystickDelta(50, 0, 50);
    expect(v.x).toBeCloseTo(1, 5);
    expect(v.y).toBeCloseTo(0, 5);
  });
});
