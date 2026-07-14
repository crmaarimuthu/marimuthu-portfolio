import { describe, expect, it } from "vitest";
import { CAR_SPEC, stepVehicle, type VehicleState } from "./vehiclePhysics";

const AT_REST: VehicleState = { x: 0, z: 0, heading: 0, speed: 0 };

function run(state: VehicleState, throttle: number, steer: number, seconds: number): VehicleState {
  let s = state;
  const dt = 1 / 60;
  for (let t = 0; t < seconds; t += dt) {
    s = stepVehicle(s, { throttle, steer }, CAR_SPEC, dt);
  }
  return s;
}

describe("stepVehicle", () => {
  it("accelerates forward along +z at heading 0", () => {
    const s = run(AT_REST, 1, 0, 1);
    expect(s.speed).toBeGreaterThan(0);
    expect(s.z).toBeGreaterThan(0);
    expect(Math.abs(s.x)).toBeLessThan(1e-6);
  });

  it("clamps at the spec's max forward speed", () => {
    const s = run(AT_REST, 1, 0, 10);
    expect(s.speed).toBeLessThanOrEqual(CAR_SPEC.maxForwardSpeed + 1e-9);
    expect(s.speed).toBeCloseTo(CAR_SPEC.maxForwardSpeed, 5);
  });

  it("coasts to a stop under rolling friction without oscillating past zero", () => {
    const moving = run(AT_REST, 1, 0, 2);
    const stopped = run(moving, 0, 0, 10);
    expect(stopped.speed).toBe(0);
  });

  it("brakes harder than it coasts", () => {
    const moving = run(AT_REST, 1, 0, 2);
    const braked = stepVehicle(moving, { throttle: -1, steer: 0 }, CAR_SPEC, 0.1);
    const coasted = stepVehicle(moving, { throttle: 0, steer: 0 }, CAR_SPEC, 0.1);
    expect(braked.speed).toBeLessThan(coasted.speed);
    expect(braked.speed).toBeGreaterThanOrEqual(0); // braking never flips straight into reverse
  });

  it("reverses when throttle is held negative from rest", () => {
    const s = run(AT_REST, -1, 0, 2);
    expect(s.speed).toBeLessThan(0);
    expect(s.speed).toBeGreaterThanOrEqual(-CAR_SPEC.maxReverseSpeed - 1e-9);
    expect(s.z).toBeLessThan(0);
  });

  it("does not turn while stationary", () => {
    const s = stepVehicle(AT_REST, { throttle: 0, steer: 1 }, CAR_SPEC, 0.5);
    expect(s.heading).toBe(0);
  });

  it("turns toward positive heading with positive steer while moving forward", () => {
    const s = run(AT_REST, 1, 1, 1);
    expect(s.heading).toBeGreaterThan(0);
  });

  it("steering flips while reversing", () => {
    const s = run(AT_REST, -1, 1, 1.5);
    expect(s.heading).toBeLessThan(0);
  });
});
