export type NPCState =
  | "SPAWNING"
  | "IDLE"
  | "WALKING"
  | "SITTING"
  | "WORKING"
  | "TYPING"
  | "THINKING"
  | "TALKING"
  | "MEETING"
  | "BREAK"
  | "LEAVING"
  | "OFF_DUTY";

export type NPCEvent =
  | "SPAWNED"
  | "BEGIN_WALK"
  | "ARRIVE_AT_SEAT"
  | "BEGIN_WORK"
  | "BEGIN_TYPING"
  | "BEGIN_THINKING"
  | "RESUME_TYPING"
  | "LEAVE_DESK"
  | "ARRIVE_AT_MEETING"
  | "MEETING_OVER"
  | "ARRIVE_AT_BREAK"
  | "BREAK_OVER"
  | "APPROACHED_BY_PLAYER"
  | "DIALOGUE_ENDED"
  | "BEGIN_LEAVING"
  | "WENT_OFF_DUTY"
  | "SHIFT_STARTED";

/**
 * Every state a resumable activity can be interrupted from also accepts
 * APPROACHED_BY_PLAYER -> TALKING, and TALKING always returns to the
 * state that was active before the interruption (see
 * reduceNpcState's second parameter) — that "return to previous valid
 * state" behaviour is not expressible as a static table, so TALKING and
 * DIALOGUE_ENDED are handled specially in reduceNpcState rather than in
 * this table. See docs/NPC_SYSTEM.md.
 */
const ALLOWED_TRANSITIONS: Record<NPCState, Partial<Record<NPCEvent, NPCState>>> = {
  SPAWNING: { SPAWNED: "IDLE" },
  IDLE: { BEGIN_WALK: "WALKING", WENT_OFF_DUTY: "OFF_DUTY" },
  WALKING: {
    ARRIVE_AT_SEAT: "SITTING",
    ARRIVE_AT_MEETING: "MEETING",
    ARRIVE_AT_BREAK: "BREAK",
    BEGIN_LEAVING: "LEAVING",
  },
  SITTING: { BEGIN_WORK: "WORKING", LEAVE_DESK: "WALKING" },
  WORKING: { BEGIN_TYPING: "TYPING", LEAVE_DESK: "WALKING" },
  TYPING: { BEGIN_THINKING: "THINKING", LEAVE_DESK: "WALKING" },
  THINKING: { RESUME_TYPING: "TYPING", LEAVE_DESK: "WALKING" },
  TALKING: {}, // handled specially — returns to the pre-interruption state
  MEETING: { MEETING_OVER: "WALKING" },
  BREAK: { BREAK_OVER: "WALKING" },
  LEAVING: { WENT_OFF_DUTY: "OFF_DUTY" },
  OFF_DUTY: { SHIFT_STARTED: "SPAWNING" },
};

/**
 * States where a TALKING interruption is permitted. WORKING/TYPING/
 * THINKING/SITTING/IDLE/WALKING/BREAK are all interruptible; MEETING and
 * LEAVING are not (an NPC mid-meeting or already walking out for the
 * day cannot be pulled into a conversation) — the interruption policy
 * required by section 7 of the brief.
 */
const INTERRUPTIBLE_STATES: NPCState[] = [
  "IDLE",
  "WALKING",
  "SITTING",
  "WORKING",
  "TYPING",
  "THINKING",
  "BREAK",
];

export interface NpcStateResult {
  state: NPCState;
  /** Set only when entering TALKING — remembered so DIALOGUE_ENDED can restore it. */
  resumeState?: NPCState;
}

/**
 * Deterministic NPC state reducer. `resumeState` must be threaded
 * through by the caller (see useNpcStore) so TALKING can be exited back
 * to whatever was active before the conversation — reducers are pure
 * and stateless, so the "previous state" has to be explicit input, not
 * implicit memory.
 */
export function reduceNpcState(
  current: NPCState,
  event: NPCEvent,
  resumeState: NPCState | null,
): NpcStateResult {
  if (event === "APPROACHED_BY_PLAYER") {
    if (current === "TALKING" || !INTERRUPTIBLE_STATES.includes(current)) {
      return { state: current, resumeState: resumeState ?? undefined };
    }
    return { state: "TALKING", resumeState: current };
  }

  if (event === "DIALOGUE_ENDED") {
    if (current !== "TALKING") return { state: current, resumeState: resumeState ?? undefined };
    return { state: resumeState ?? "IDLE" };
  }

  const next = ALLOWED_TRANSITIONS[current][event];
  if (!next) return { state: current, resumeState: resumeState ?? undefined };
  return { state: next, resumeState: resumeState ?? undefined };
}

export function isNpcTransitionAllowed(current: NPCState, event: NPCEvent): boolean {
  if (event === "APPROACHED_BY_PLAYER") return INTERRUPTIBLE_STATES.includes(current);
  if (event === "DIALOGUE_ENDED") return current === "TALKING";
  return ALLOWED_TRANSITIONS[current][event] !== undefined;
}
