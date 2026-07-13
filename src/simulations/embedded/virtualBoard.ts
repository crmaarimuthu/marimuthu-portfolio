import type { VirtualFirmwareImage } from "./virtualFirmwareImage";
import type { GpioPinState } from "./virtualGpio";

export type BoardState = "OFF" | "READY" | "FLASHING" | "PROGRAMMED" | "RUNNING" | "FAULT";

export type BoardEvent =
  | "POWER_ON"
  | "BEGIN_FLASH"
  | "FLASH_COMPLETE"
  | "FLASH_FAILED"
  | "START"
  | "STOP"
  | "FAULT"
  | "RESET";

export interface VirtualBoardModel {
  boardId: string;
  displayName: string;
  state: BoardState;
  firmwareImage: VirtualFirmwareImage | null;
  gpio: Record<number, GpioPinState>;
  powerState: "OFF" | "ON";
}

export function createInitialBoard(boardId: string, displayName: string): VirtualBoardModel {
  return {
    boardId,
    displayName,
    state: "OFF",
    firmwareImage: null,
    gpio: {},
    powerState: "OFF",
  };
}

const ALLOWED_TRANSITIONS: Record<BoardState, Partial<Record<BoardEvent, BoardState>>> = {
  OFF: { POWER_ON: "READY" },
  READY: { BEGIN_FLASH: "FLASHING" },
  FLASHING: { FLASH_COMPLETE: "PROGRAMMED", FLASH_FAILED: "READY" },
  PROGRAMMED: { START: "RUNNING", BEGIN_FLASH: "FLASHING" },
  RUNNING: { STOP: "PROGRAMMED" },
  FAULT: {},
};

/**
 * Board reducer. `firmwareImage` is only set on FLASH_COMPLETE (payload
 * passed alongside the event via `reduceBoardEvent`'s second argument);
 * RESET is accepted from any state and clears the board back to OFF
 * with no image/GPIO — used by "Reset Demo" (docs/EMBEDDED_SIMULATION.md).
 */
export function reduceBoardEvent(
  board: VirtualBoardModel,
  event: BoardEvent,
  payload?: { image?: VirtualFirmwareImage },
): VirtualBoardModel {
  if (event === "RESET") {
    return createInitialBoard(board.boardId, board.displayName);
  }
  if (event === "FAULT") {
    return { ...board, state: "FAULT" };
  }

  const nextState = ALLOWED_TRANSITIONS[board.state][event];
  if (!nextState) return board;

  const powerState = nextState === "OFF" ? "OFF" : "ON";

  if (event === "FLASH_COMPLETE") {
    return { ...board, state: nextState, powerState, firmwareImage: payload?.image ?? board.firmwareImage };
  }
  if (event === "FLASH_FAILED") {
    return { ...board, state: nextState, powerState };
  }

  return { ...board, state: nextState, powerState };
}
