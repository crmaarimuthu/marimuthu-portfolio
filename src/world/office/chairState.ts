export type ChairState = "AVAILABLE" | "RESERVED" | "OCCUPIED";

export type PlayerLocomotionState = "NORMAL" | "SEATED" | "TRANSITIONING";

export interface ChairInteractionState {
  chairState: ChairState;
  playerState: PlayerLocomotionState;
}

export const INITIAL_CHAIR_INTERACTION_STATE: ChairInteractionState = {
  chairState: "AVAILABLE",
  playerState: "NORMAL",
};

export interface SitRequestResult {
  allowed: boolean;
  reason?: "chair-not-available" | "player-not-idle";
  next?: ChairInteractionState;
}

/**
 * Validates and resolves a SIT_AT_CHAIR request. Does not itself move
 * the player — the runtime (PlayerCapsule/InteractionController) is
 * responsible for the alignment transition once this returns allowed.
 */
export function requestSit(current: ChairInteractionState): SitRequestResult {
  if (current.chairState !== "AVAILABLE") {
    return { allowed: false, reason: "chair-not-available" };
  }
  if (current.playerState !== "NORMAL") {
    return { allowed: false, reason: "player-not-idle" };
  }
  return {
    allowed: true,
    next: { chairState: "RESERVED", playerState: "TRANSITIONING" },
  };
}

/** Called once the seat-alignment transition finishes. */
export function completeSit(current: ChairInteractionState): ChairInteractionState {
  if (current.chairState !== "RESERVED" || current.playerState !== "TRANSITIONING") {
    return current;
  }
  return { chairState: "OCCUPIED", playerState: "SEATED" };
}

export interface StandRequestResult {
  allowed: boolean;
  reason?: "not-seated" | "stand-anchor-blocked";
  next?: ChairInteractionState;
}

/**
 * Validates a STAND_FROM_CHAIR request. `isStandAnchorBlocked` is
 * supplied by the caller (it depends on live 3D collision state, which
 * this module has no knowledge of) so the rule stays pure/testable
 * while still letting the runtime reject standing into a wall/desk.
 */
export function requestStand(
  current: ChairInteractionState,
  isStandAnchorBlocked: boolean,
): StandRequestResult {
  if (current.chairState !== "OCCUPIED" || current.playerState !== "SEATED") {
    return { allowed: false, reason: "not-seated" };
  }
  if (isStandAnchorBlocked) {
    return { allowed: false, reason: "stand-anchor-blocked" };
  }
  return {
    allowed: true,
    next: { chairState: "RESERVED", playerState: "TRANSITIONING" },
  };
}

/** Called once the stand-up alignment transition finishes. */
export function completeStand(current: ChairInteractionState): ChairInteractionState {
  if (current.chairState !== "RESERVED" || current.playerState !== "TRANSITIONING") {
    return current;
  }
  return { chairState: "AVAILABLE", playerState: "NORMAL" };
}
