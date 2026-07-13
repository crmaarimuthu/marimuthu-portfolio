import { describe, expect, it } from "vitest";
import { DEMO_FIRMWARE_PROJECT } from "./FirmwareProject";
import { createVirtualFirmwareImage } from "./virtualFirmwareImage";
import { isFlashValid, nextFlashStage, validateFlashTarget } from "./flashSimulator";

const image = createVirtualFirmwareImage(DEMO_FIRMWARE_PROJECT, 1000);

describe("validateFlashTarget", () => {
  it("is valid for a matching, available, idle board", () => {
    const diagnostics = validateFlashTarget({
      image,
      boardId: DEMO_FIRMWARE_PROJECT.targetBoardId,
      boardAvailable: true,
      boardCurrentlyFlashing: false,
    });
    expect(isFlashValid(diagnostics)).toBe(true);
  });

  it("errors when there is no image", () => {
    const diagnostics = validateFlashTarget({
      image: null,
      boardId: DEMO_FIRMWARE_PROJECT.targetBoardId,
      boardAvailable: true,
      boardCurrentlyFlashing: false,
    });
    expect(isFlashValid(diagnostics)).toBe(false);
  });

  it("errors when the image targets a different board", () => {
    const diagnostics = validateFlashTarget({
      image,
      boardId: "some-other-board",
      boardAvailable: true,
      boardCurrentlyFlashing: false,
    });
    expect(isFlashValid(diagnostics)).toBe(false);
  });

  it("errors when the board is unavailable", () => {
    const diagnostics = validateFlashTarget({
      image,
      boardId: DEMO_FIRMWARE_PROJECT.targetBoardId,
      boardAvailable: false,
      boardCurrentlyFlashing: false,
    });
    expect(isFlashValid(diagnostics)).toBe(false);
  });

  it("errors when the board is already flashing", () => {
    const diagnostics = validateFlashTarget({
      image,
      boardId: DEMO_FIRMWARE_PROJECT.targetBoardId,
      boardAvailable: true,
      boardCurrentlyFlashing: true,
    });
    expect(isFlashValid(diagnostics)).toBe(false);
  });
});

describe("nextFlashStage", () => {
  it("progresses CONNECTING -> ERASING -> PROGRAMMING -> VERIFYING -> SUCCESS when valid", () => {
    let stage = nextFlashStage("IDLE", true);
    expect(stage).toBe("CONNECTING");
    stage = nextFlashStage(stage, true);
    expect(stage).toBe("ERASING");
    stage = nextFlashStage(stage, true);
    expect(stage).toBe("PROGRAMMING");
    stage = nextFlashStage(stage, true);
    expect(stage).toBe("VERIFYING");
    stage = nextFlashStage(stage, true);
    expect(stage).toBe("SUCCESS");
  });

  it("fails immediately at CONNECTING when invalid", () => {
    expect(nextFlashStage("CONNECTING", false)).toBe("FAILED");
  });

  it("SUCCESS and FAILED are terminal", () => {
    expect(nextFlashStage("SUCCESS", true)).toBe("SUCCESS");
    expect(nextFlashStage("FAILED", true)).toBe("FAILED");
  });
});
