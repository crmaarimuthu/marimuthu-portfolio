import { describe, expect, it } from "vitest";
import { isEmbeddedTransitionAllowed, reduceEmbeddedTaskState, type EmbeddedTaskState } from "./embeddedTaskState";

describe("embedded task state machine — happy path", () => {
  it("walks the full success flow from NOT_STARTED to COMPLETED", () => {
    const flow: Array<[EmbeddedTaskState, EmbeddedTaskState]> = [
      ["NOT_STARTED", "WORKSTATION_READY"],
      ["WORKSTATION_READY", "PROJECT_OPEN"],
      ["PROJECT_OPEN", "SOURCE_READY"],
      ["SOURCE_READY", "BUILDING"],
      ["BUILDING", "BUILD_SUCCESS"],
      ["BUILD_SUCCESS", "FLASH_READY"],
      ["FLASH_READY", "FLASHING"],
      ["FLASHING", "FLASH_SUCCESS"],
      ["FLASH_SUCCESS", "BOARD_READY"],
      ["BOARD_READY", "BOARD_RUNNING"],
      ["BOARD_RUNNING", "TASK_SUCCESS"],
      ["TASK_SUCCESS", "CELEBRATING"],
      ["CELEBRATING", "COMPLETED"],
    ];

    const events = [
      "ENTER_WORKSTATION",
      "OPEN_PROJECT",
      "VIEW_SOURCE",
      "START_BUILD",
      "BUILD_SUCCEEDED",
      "PREPARE_FLASH",
      "START_FLASH",
      "FLASH_SUCCEEDED",
      "PREPARE_BOARD",
      "START_BOARD",
      "TASK_VERIFIED",
      "CELEBRATE",
      "FINISH",
    ] as const;

    let state: EmbeddedTaskState = "NOT_STARTED";
    flow.forEach(([, expected], i) => {
      state = reduceEmbeddedTaskState(state, events[i]);
      expect(state).toBe(expected);
    });
  });
});

describe("embedded task state machine — failure/retry paths", () => {
  it("BUILDING -> BUILD_FAILED -> SOURCE_READY on retry", () => {
    let state = reduceEmbeddedTaskState("BUILDING", "BUILD_FAILED_EVENT");
    expect(state).toBe("BUILD_FAILED");
    state = reduceEmbeddedTaskState(state, "RETRY_BUILD");
    expect(state).toBe("SOURCE_READY");
  });

  it("FLASHING -> FLASH_FAILED -> FLASH_READY on retry", () => {
    let state = reduceEmbeddedTaskState("FLASHING", "FLASH_FAILED_EVENT");
    expect(state).toBe("FLASH_FAILED");
    state = reduceEmbeddedTaskState(state, "RETRY_FLASH");
    expect(state).toBe("FLASH_READY");
  });
});

describe("embedded task state machine — invalid transitions", () => {
  it("rejects START_BUILD from NOT_STARTED", () => {
    expect(reduceEmbeddedTaskState("NOT_STARTED", "START_BUILD")).toBe("NOT_STARTED");
  });

  it("rejects TASK_VERIFIED before BOARD_RUNNING", () => {
    expect(reduceEmbeddedTaskState("BOARD_READY", "TASK_VERIFIED")).toBe("BOARD_READY");
  });

  it("rejects re-entering workstation from a mid-flow state", () => {
    expect(reduceEmbeddedTaskState("BUILDING", "ENTER_WORKSTATION")).toBe("BUILDING");
  });

  it("isEmbeddedTransitionAllowed matches reducer behaviour", () => {
    expect(isEmbeddedTransitionAllowed("SOURCE_READY", "START_BUILD")).toBe(true);
    expect(isEmbeddedTransitionAllowed("SOURCE_READY", "START_FLASH")).toBe(false);
  });
});

describe("embedded task state machine — reset", () => {
  it("RESET returns to NOT_STARTED from any state", () => {
    const states: EmbeddedTaskState[] = ["BUILDING", "FLASH_FAILED", "BOARD_RUNNING", "COMPLETED"];
    for (const s of states) {
      expect(reduceEmbeddedTaskState(s, "RESET")).toBe("NOT_STARTED");
    }
  });
});
