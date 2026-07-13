export type EmbeddedTaskState =
  | "NOT_STARTED"
  | "WORKSTATION_READY"
  | "PROJECT_OPEN"
  | "SOURCE_READY"
  | "BUILDING"
  | "BUILD_FAILED"
  | "BUILD_SUCCESS"
  | "FLASH_READY"
  | "FLASHING"
  | "FLASH_FAILED"
  | "FLASH_SUCCESS"
  | "BOARD_READY"
  | "BOARD_RUNNING"
  | "TASK_SUCCESS"
  | "CELEBRATING"
  | "COMPLETED";

export type EmbeddedTaskEvent =
  | "ENTER_WORKSTATION"
  | "OPEN_PROJECT"
  | "VIEW_SOURCE"
  | "START_BUILD"
  | "BUILD_SUCCEEDED"
  | "BUILD_FAILED_EVENT"
  | "RETRY_BUILD"
  | "PREPARE_FLASH"
  | "START_FLASH"
  | "FLASH_SUCCEEDED"
  | "FLASH_FAILED_EVENT"
  | "RETRY_FLASH"
  | "PREPARE_BOARD"
  | "START_BOARD"
  | "TASK_VERIFIED"
  | "CELEBRATE"
  | "FINISH"
  | "RESET";

const ALLOWED_TRANSITIONS: Record<EmbeddedTaskState, Partial<Record<EmbeddedTaskEvent, EmbeddedTaskState>>> = {
  NOT_STARTED: { ENTER_WORKSTATION: "WORKSTATION_READY" },
  WORKSTATION_READY: { OPEN_PROJECT: "PROJECT_OPEN" },
  PROJECT_OPEN: { VIEW_SOURCE: "SOURCE_READY" },
  SOURCE_READY: { START_BUILD: "BUILDING" },
  BUILDING: { BUILD_SUCCEEDED: "BUILD_SUCCESS", BUILD_FAILED_EVENT: "BUILD_FAILED" },
  BUILD_FAILED: { RETRY_BUILD: "SOURCE_READY" },
  BUILD_SUCCESS: { PREPARE_FLASH: "FLASH_READY" },
  FLASH_READY: { START_FLASH: "FLASHING" },
  FLASHING: { FLASH_SUCCEEDED: "FLASH_SUCCESS", FLASH_FAILED_EVENT: "FLASH_FAILED" },
  FLASH_FAILED: { RETRY_FLASH: "FLASH_READY" },
  FLASH_SUCCESS: { PREPARE_BOARD: "BOARD_READY" },
  BOARD_READY: { START_BOARD: "BOARD_RUNNING" },
  BOARD_RUNNING: { TASK_VERIFIED: "TASK_SUCCESS" },
  TASK_SUCCESS: { CELEBRATE: "CELEBRATING" },
  CELEBRATING: { FINISH: "COMPLETED" },
  COMPLETED: {},
};

/**
 * Deterministic reducer for the embedded firmware task. Every state
 * (including COMPLETED and every failure/terminal state) also accepts
 * RESET, which returns to NOT_STARTED — this is the "Reset Demo" flow
 * (see docs/EMBEDDED_SIMULATION.md "Task reset"). All other invalid
 * transitions are rejected (the reducer returns the same state).
 */
export function reduceEmbeddedTaskState(
  current: EmbeddedTaskState,
  event: EmbeddedTaskEvent,
): EmbeddedTaskState {
  if (event === "RESET") return "NOT_STARTED";
  return ALLOWED_TRANSITIONS[current][event] ?? current;
}

export function isEmbeddedTransitionAllowed(
  current: EmbeddedTaskState,
  event: EmbeddedTaskEvent,
): boolean {
  if (event === "RESET") return true;
  return ALLOWED_TRANSITIONS[current][event] !== undefined;
}
