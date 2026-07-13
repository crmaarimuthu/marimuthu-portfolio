import { describe, expect, it } from "vitest";
import {
  completeCelebrateAnimation,
  completeSitAnimation,
  completeStandAnimation,
  isTransitionAllowed,
  nextAnimationState,
  requestCelebrateAnimation,
  requestSitAnimation,
  requestStandAnimation,
  requestWorkActivity,
} from "./animationState";

describe("animation state machine — locomotion", () => {
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

  it("nextAnimationState is a no-op while seated/transitioning", () => {
    expect(nextAnimationState("SITTING", true, true)).toBe("SITTING");
    expect(nextAnimationState("SIT_DOWN", true, false)).toBe("SIT_DOWN");
    expect(nextAnimationState("STAND_UP", false, false)).toBe("STAND_UP");
  });
});

describe("animation state machine — sit/stand", () => {
  it("requestSitAnimation moves IDLE -> SIT_DOWN", () => {
    expect(requestSitAnimation("IDLE")).toBe("SIT_DOWN");
  });

  it("requestSitAnimation rejects from WALK/RUN", () => {
    expect(requestSitAnimation("WALK")).toBe("WALK");
    expect(requestSitAnimation("RUN")).toBe("RUN");
  });

  it("completeSitAnimation moves SIT_DOWN -> SITTING", () => {
    expect(completeSitAnimation("SIT_DOWN")).toBe("SITTING");
  });

  it("completeSitAnimation is a no-op outside SIT_DOWN", () => {
    expect(completeSitAnimation("IDLE")).toBe("IDLE");
  });

  it("requestStandAnimation moves SITTING -> STAND_UP", () => {
    expect(requestStandAnimation("SITTING")).toBe("STAND_UP");
  });

  it("requestStandAnimation rejects outside SITTING", () => {
    expect(requestStandAnimation("IDLE")).toBe("IDLE");
  });

  it("completeStandAnimation moves STAND_UP -> IDLE", () => {
    expect(completeStandAnimation("STAND_UP")).toBe("IDLE");
  });

  it("full sit-then-stand cycle returns to IDLE", () => {
    let state = requestSitAnimation("IDLE");
    state = completeSitAnimation(state);
    state = requestStandAnimation(state);
    state = completeStandAnimation(state);
    expect(state).toBe("IDLE");
  });
});

describe("animation state machine — workstation activity", () => {
  it("requestWorkActivity allows SITTING -> TYPE/DEBUG/INSPECT_BOARD", () => {
    expect(requestWorkActivity("SITTING", "TYPE")).toBe("TYPE");
    expect(requestWorkActivity("SITTING", "DEBUG")).toBe("DEBUG");
    expect(requestWorkActivity("SITTING", "INSPECT_BOARD")).toBe("INSPECT_BOARD");
  });

  it("requestWorkActivity allows TYPE -> DEBUG but rejects TYPE -> INSPECT_BOARD directly", () => {
    expect(requestWorkActivity("TYPE", "DEBUG")).toBe("DEBUG");
    expect(requestWorkActivity("TYPE", "INSPECT_BOARD")).toBe("TYPE");
  });

  it("requestWorkActivity rejects from locomotion states", () => {
    expect(requestWorkActivity("WALK", "TYPE")).toBe("WALK");
    expect(requestWorkActivity("IDLE", "DEBUG")).toBe("IDLE");
  });

  it("requestCelebrateAnimation only allowed from INSPECT_BOARD", () => {
    expect(requestCelebrateAnimation("INSPECT_BOARD")).toBe("CELEBRATE");
    expect(requestCelebrateAnimation("SITTING")).toBe("SITTING");
    expect(requestCelebrateAnimation("TYPE")).toBe("TYPE");
  });

  it("completeCelebrateAnimation returns to SITTING", () => {
    expect(completeCelebrateAnimation("CELEBRATE")).toBe("SITTING");
  });

  it("full work-then-celebrate cycle: SITTING -> TYPE -> DEBUG -> INSPECT_BOARD -> CELEBRATE -> SITTING", () => {
    let state = requestWorkActivity("SITTING", "TYPE");
    state = requestWorkActivity(state, "DEBUG");
    state = requestWorkActivity(state, "INSPECT_BOARD");
    state = requestCelebrateAnimation(state);
    expect(state).toBe("CELEBRATE");
    state = completeCelebrateAnimation(state);
    expect(state).toBe("SITTING");
  });
});
