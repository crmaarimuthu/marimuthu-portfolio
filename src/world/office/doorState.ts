export type DoorState = "CLOSED" | "OPENING" | "OPEN" | "CLOSING" | "LOCKED";

export type DoorEvent = "REQUEST_OPEN" | "REQUEST_CLOSE" | "OPEN_ANIMATION_DONE" | "CLOSE_ANIMATION_DONE" | "LOCK" | "UNLOCK";

const ALLOWED_TRANSITIONS: Record<DoorState, Partial<Record<DoorEvent, DoorState>>> = {
  CLOSED: {
    REQUEST_OPEN: "OPENING",
    LOCK: "LOCKED",
  },
  OPENING: {
    OPEN_ANIMATION_DONE: "OPEN",
  },
  OPEN: {
    REQUEST_CLOSE: "CLOSING",
  },
  CLOSING: {
    CLOSE_ANIMATION_DONE: "CLOSED",
    // A close can be interrupted by a fresh open request mid-swing.
    REQUEST_OPEN: "OPENING",
  },
  LOCKED: {
    UNLOCK: "CLOSED",
  },
};

export interface DoorConfig {
  id: string;
  position: [number, number, number];
  /** Y-axis rotation (radians) of the door frame at rest. */
  rotation: number;
  openDirection: 1 | -1;
  openAngle: number;
  locked: boolean;
}

/**
 * Deterministic door state reducer. Returns the same state if the event
 * is not a valid transition from the current state (invalid transitions
 * are rejected, not silently coerced).
 */
export function reduceDoorState(current: DoorState, event: DoorEvent): DoorState {
  return ALLOWED_TRANSITIONS[current][event] ?? current;
}

/**
 * Only a fully OPEN door is non-colliding. CLOSED/LOCKED/OPENING/CLOSING
 * all still block the player's simplified collider — this is an
 * intentional simplification (see docs/OFFICE_WORLD.md "Known
 * limitations") to avoid the player clipping through a half-swung door
 * mesh.
 */
export function isDoorTraversable(state: DoorState): boolean {
  return state === "OPEN";
}

/** True while the door mesh should be actively animating its swing. */
export function isDoorAnimating(state: DoorState): boolean {
  return state === "OPENING" || state === "CLOSING";
}
