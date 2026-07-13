import { describe, expect, it } from "vitest";
import { createInitialBoard, reduceBoardEvent } from "./virtualBoard";
import { DEMO_FIRMWARE_PROJECT } from "./FirmwareProject";
import { createVirtualFirmwareImage } from "./virtualFirmwareImage";

const image = createVirtualFirmwareImage(DEMO_FIRMWARE_PROJECT, 1000);

describe("virtual board state machine", () => {
  it("starts OFF", () => {
    const board = createInitialBoard("virtual-embedded-board", "Virtual Embedded Board");
    expect(board.state).toBe("OFF");
    expect(board.powerState).toBe("OFF");
  });

  it("walks OFF -> READY -> FLASHING -> PROGRAMMED -> RUNNING -> PROGRAMMED", () => {
    let board = createInitialBoard("virtual-embedded-board", "Virtual Embedded Board");
    board = reduceBoardEvent(board, "POWER_ON");
    expect(board.state).toBe("READY");
    board = reduceBoardEvent(board, "BEGIN_FLASH");
    expect(board.state).toBe("FLASHING");
    board = reduceBoardEvent(board, "FLASH_COMPLETE", { image });
    expect(board.state).toBe("PROGRAMMED");
    expect(board.firmwareImage).toEqual(image);
    board = reduceBoardEvent(board, "START");
    expect(board.state).toBe("RUNNING");
    board = reduceBoardEvent(board, "STOP");
    expect(board.state).toBe("PROGRAMMED");
  });

  it("FLASHING -> READY on FLASH_FAILED", () => {
    let board = createInitialBoard("b", "Board");
    board = reduceBoardEvent(board, "POWER_ON");
    board = reduceBoardEvent(board, "BEGIN_FLASH");
    board = reduceBoardEvent(board, "FLASH_FAILED");
    expect(board.state).toBe("READY");
  });

  it("rejects START from READY (must be PROGRAMMED first)", () => {
    let board = createInitialBoard("b", "Board");
    board = reduceBoardEvent(board, "POWER_ON");
    const before = board;
    board = reduceBoardEvent(board, "START");
    expect(board).toEqual(before);
  });

  it("rejects BEGIN_FLASH while OFF", () => {
    const board = createInitialBoard("b", "Board");
    const result = reduceBoardEvent(board, "BEGIN_FLASH");
    expect(result.state).toBe("OFF");
  });

  it("RESET returns to a clean OFF board from any state, clearing firmwareImage", () => {
    let board = createInitialBoard("b", "Board");
    board = reduceBoardEvent(board, "POWER_ON");
    board = reduceBoardEvent(board, "BEGIN_FLASH");
    board = reduceBoardEvent(board, "FLASH_COMPLETE", { image });
    board = reduceBoardEvent(board, "START");
    board = reduceBoardEvent(board, "RESET");
    expect(board.state).toBe("OFF");
    expect(board.firmwareImage).toBeNull();
    expect(board.gpio).toEqual({});
  });
});
