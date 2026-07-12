/**
 * Milestone 1 subset of the full animation state machine described in the
 * project brief (IDLE/WALK/RUN/SIT/etc). Later milestones extend
 * ALLOWED_TRANSITIONS rather than replacing this module.
 */
export type PlayerAnimationState = "IDLE" | "WALK" | "RUN";

const ALLOWED_TRANSITIONS: Record<PlayerAnimationState, PlayerAnimationState[]> = {
  IDLE: ["IDLE", "WALK", "RUN"],
  WALK: ["WALK", "IDLE", "RUN"],
  RUN: ["RUN", "IDLE", "WALK"],
};

export function isTransitionAllowed(
  from: PlayerAnimationState,
  to: PlayerAnimationState,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function nextAnimationState(
  current: PlayerAnimationState,
  hasMoveInput: boolean,
  running: boolean,
): PlayerAnimationState {
  const desired: PlayerAnimationState = !hasMoveInput ? "IDLE" : running ? "RUN" : "WALK";
  return isTransitionAllowed(current, desired) ? desired : current;
}
