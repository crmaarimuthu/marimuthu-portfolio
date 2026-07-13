/**
 * Player animation state machine. Milestone 1 introduced the locomotion
 * subset (IDLE/WALK/RUN); Milestone 3 adds the seated-interaction
 * subset (SIT_DOWN/SITTING/STAND_UP) needed for chair interactions.
 * Later milestones (TALK/TYPE/DEBUG/INSPECT_BOARD/CELEBRATE/SLEEP/DRIVE)
 * extend ALLOWED_TRANSITIONS rather than replacing this module.
 */
export type PlayerAnimationState =
  | "IDLE"
  | "WALK"
  | "RUN"
  | "SIT_DOWN"
  | "SITTING"
  | "STAND_UP";

const ALLOWED_TRANSITIONS: Record<PlayerAnimationState, PlayerAnimationState[]> = {
  IDLE: ["IDLE", "WALK", "RUN", "SIT_DOWN"],
  WALK: ["WALK", "IDLE", "RUN"],
  RUN: ["RUN", "IDLE", "WALK"],
  SIT_DOWN: ["SIT_DOWN", "SITTING"],
  SITTING: ["SITTING", "STAND_UP"],
  STAND_UP: ["STAND_UP", "IDLE"],
};

export function isTransitionAllowed(
  from: PlayerAnimationState,
  to: PlayerAnimationState,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Locomotion-driven transitions (IDLE/WALK/RUN). Only meaningful while
 * the player is not seated/transitioning — callers must not invoke this
 * while in SIT_DOWN/SITTING/STAND_UP (PlayerCapsule gates movement input
 * during those states, so this is naturally not called then).
 */
export function nextAnimationState(
  current: PlayerAnimationState,
  hasMoveInput: boolean,
  running: boolean,
): PlayerAnimationState {
  if (current !== "IDLE" && current !== "WALK" && current !== "RUN") {
    return current;
  }
  const desired: PlayerAnimationState = !hasMoveInput ? "IDLE" : running ? "RUN" : "WALK";
  return isTransitionAllowed(current, desired) ? desired : current;
}

/** Begins the seated transition; only valid from IDLE. */
export function requestSitAnimation(current: PlayerAnimationState): PlayerAnimationState {
  return isTransitionAllowed(current, "SIT_DOWN") ? "SIT_DOWN" : current;
}

/** Called when the SIT_DOWN clip/transition finishes. */
export function completeSitAnimation(current: PlayerAnimationState): PlayerAnimationState {
  return isTransitionAllowed(current, "SITTING") ? "SITTING" : current;
}

/** Begins the stand-up transition; only valid from SITTING. */
export function requestStandAnimation(current: PlayerAnimationState): PlayerAnimationState {
  return isTransitionAllowed(current, "STAND_UP") ? "STAND_UP" : current;
}

/** Called when the STAND_UP clip/transition finishes. */
export function completeStandAnimation(current: PlayerAnimationState): PlayerAnimationState {
  return isTransitionAllowed(current, "IDLE") ? "IDLE" : current;
}
