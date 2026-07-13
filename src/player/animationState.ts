/**
 * Player animation state machine. Milestone 1 introduced the locomotion
 * subset (IDLE/WALK/RUN); Milestone 3 added the seated-interaction
 * subset (SIT_DOWN/SITTING/STAND_UP); Milestone 4 adds the workstation
 * work-activity subset (TYPE/DEBUG/INSPECT_BOARD/CELEBRATE) needed for
 * the embedded firmware task. Later milestones (TALK/SLEEP/DRIVE) extend
 * ALLOWED_TRANSITIONS rather than replacing this module.
 */
export type PlayerAnimationState =
  | "IDLE"
  | "WALK"
  | "RUN"
  | "SIT_DOWN"
  | "SITTING"
  | "STAND_UP"
  | "TYPE"
  | "DEBUG"
  | "INSPECT_BOARD"
  | "CELEBRATE";

const ALLOWED_TRANSITIONS: Record<PlayerAnimationState, PlayerAnimationState[]> = {
  IDLE: ["IDLE", "WALK", "RUN", "SIT_DOWN"],
  WALK: ["WALK", "IDLE", "RUN"],
  RUN: ["RUN", "IDLE", "WALK"],
  SIT_DOWN: ["SIT_DOWN", "SITTING"],
  SITTING: ["SITTING", "STAND_UP", "TYPE", "DEBUG", "INSPECT_BOARD"],
  STAND_UP: ["STAND_UP", "IDLE"],
  TYPE: ["TYPE", "SITTING", "DEBUG"],
  DEBUG: ["DEBUG", "SITTING", "TYPE", "INSPECT_BOARD"],
  INSPECT_BOARD: ["INSPECT_BOARD", "SITTING", "CELEBRATE"],
  CELEBRATE: ["CELEBRATE", "SITTING"],
};

export function isTransitionAllowed(
  from: PlayerAnimationState,
  to: PlayerAnimationState,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Locomotion-driven transitions (IDLE/WALK/RUN). Only meaningful while
 * the player is not seated/transitioning/working — callers must not
 * invoke this outside IDLE/WALK/RUN (PlayerCapsule gates movement input
 * during those other states, so this is naturally not called then).
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

export type WorkActivity = "TYPE" | "DEBUG" | "INSPECT_BOARD";

/**
 * Requests a workstation work-activity clip (viewing/editing source,
 * building/flashing, inspecting the board). No-op if the requested
 * activity isn't reachable from the current state — e.g. requesting
 * INSPECT_BOARD from TYPE directly is rejected (must pass through
 * SITTING or DEBUG per ALLOWED_TRANSITIONS).
 */
export function requestWorkActivity(
  current: PlayerAnimationState,
  activity: WorkActivity,
): PlayerAnimationState {
  return isTransitionAllowed(current, activity) ? activity : current;
}

/** Begins the celebration clip; only valid from INSPECT_BOARD (task-success flow). */
export function requestCelebrateAnimation(current: PlayerAnimationState): PlayerAnimationState {
  return isTransitionAllowed(current, "CELEBRATE") ? "CELEBRATE" : current;
}

/** Called when the celebration clip finishes; returns to seated idle. */
export function completeCelebrateAnimation(current: PlayerAnimationState): PlayerAnimationState {
  return isTransitionAllowed(current, "SITTING") ? "SITTING" : current;
}
