import { describe, expect, it } from "vitest";
import { computeNextPlayerTransform, RUN_SPEED, WALK_SPEED } from "./playerMovement";
import { emptyInputState } from "@/engine/input/InputManager";

describe("computeNextPlayerTransform", () => {
  it("does not move when there is no input", () => {
    const current = { x: 0, z: 0, heading: 0 };
    const next = computeNextPlayerTransform(current, emptyInputState(), 1 / 60);
    expect(next).toEqual(current);
  });

  it("moves forward along +z when moveY is 1", () => {
    const current = { x: 0, z: 0, heading: 0 };
    const input = { ...emptyInputState(), moveY: 1 };
    const next = computeNextPlayerTransform(current, input, 1);
    expect(next.z).toBeGreaterThan(0);
  });

  it("moves faster when running than walking", () => {
    const current = { x: 0, z: 0, heading: 0 };
    const walkInput = { ...emptyInputState(), moveY: 1, running: false };
    const runInput = { ...emptyInputState(), moveY: 1, running: true };

    const walked = computeNextPlayerTransform(current, walkInput, 1);
    const ran = computeNextPlayerTransform(current, runInput, 1);

    expect(Math.abs(ran.z)).toBeGreaterThan(Math.abs(walked.z));
    expect(Math.abs(walked.z)).toBeCloseTo(WALK_SPEED, 5);
    expect(Math.abs(ran.z)).toBeCloseTo(RUN_SPEED, 5);
  });

  it("does not exceed max speed on diagonal input", () => {
    const current = { x: 0, z: 0, heading: 0 };
    const input = { ...emptyInputState(), moveX: 1, moveY: 1 };
    const next = computeNextPlayerTransform(current, input, 1);
    const distance = Math.hypot(next.x - current.x, next.z - current.z);
    expect(distance).toBeLessThanOrEqual(WALK_SPEED + 1e-6);
  });
});

describe("computeNextPlayerTransform — camera-relative movement", () => {
  it("moving 'forward' (moveY=1) heads away from the camera at the camera's current yaw, not a fixed world axis", () => {
    const current = { x: 0, z: 0, heading: 0 };
    const input = { ...emptyInputState(), moveY: 1 };
    const cameraYaw = Math.PI / 2; // camera has been orbited 90 degrees
    const next = computeNextPlayerTransform(current, input, 5, cameraYaw);
    // After enough damping time, heading should converge toward cameraYaw.
    expect(next.heading).toBeCloseTo(cameraYaw, 1);
  });

  it("defaults to world-relative behaviour when cameraYaw is omitted (backward compatible)", () => {
    const current = { x: 0, z: 0, heading: 0 };
    const input = { ...emptyInputState(), moveY: 1 };
    const next = computeNextPlayerTransform(current, input, 1);
    expect(next.heading).toBeCloseTo(0, 5);
  });

  it("turns the character to face whichever direction is being pushed, relative to the camera", () => {
    const current = { x: 0, z: 0, heading: 0 };
    const cameraYaw = 0;
    // Strafing right (moveX=1) should turn the character toward +90 degrees.
    const input = { ...emptyInputState(), moveX: 1 };
    const next = computeNextPlayerTransform(current, input, 5, cameraYaw);
    expect(next.heading).toBeCloseTo(Math.PI / 2, 1);
  });
});
