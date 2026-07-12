import { describe, expect, it } from "vitest";
import { isTransitionAllowed, nextAnimationState } from "./animationState";

describe("animation state machine", () => {
  it("allows IDLE -> WALK -> RUN -> IDLE", () => {
    expect(isTransitionAllowed("IDLE", "WALK")).toBe(true);
    expect(isTransitionAllowed("WALK", "RUN")).toBe(true);
    expect(isTransitionAllowed("RUN", "IDLE")).toBe(true);
  });

  it("nextAnimationState resolves IDLE when there is no move input", () => {
    expect(nextAnimationState("WALK", false, false)).toBe("IDLE");
  });

  it("nextAnimationState resolves RUN when moving and running", () => {
    expect(nextAnimationState("IDLE", true, true)).toBe("RUN");
  });

  it("nextAnimationState resolves WALK when moving and not running", () => {
    expect(nextAnimationState("IDLE", true, false)).toBe("WALK");
  });
});
