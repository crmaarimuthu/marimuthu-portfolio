import type { VirtualFirmwareImage } from "./virtualFirmwareImage";
import type { BuildDiagnostic } from "./buildSimulator";

export type FlashStage = "IDLE" | "CONNECTING" | "ERASING" | "PROGRAMMING" | "VERIFYING" | "SUCCESS" | "FAILED";

const STAGED_SEQUENCE: FlashStage[] = ["CONNECTING", "ERASING", "PROGRAMMING", "VERIFYING"];

export interface FlashTargetInput {
  image: VirtualFirmwareImage | null;
  boardId: string;
  boardAvailable: boolean;
  boardCurrentlyFlashing: boolean;
}

/**
 * Validates the flash target — image exists, targets the connected
 * board, and the board isn't already busy. Never claims a real
 * USB/J-Link/ST-Link/DAP debug probe is attached — see
 * docs/EMBEDDED_SIMULATION.md.
 */
export function validateFlashTarget(input: FlashTargetInput): BuildDiagnostic[] {
  const diagnostics: BuildDiagnostic[] = [];

  if (!input.image) {
    diagnostics.push({ level: "ERROR", message: "No virtual firmware image is available to flash." });
    return diagnostics;
  }
  if (input.image.targetBoardId !== input.boardId) {
    diagnostics.push({ level: "ERROR", message: "Firmware image does not target the connected virtual board." });
  }
  if (!input.boardAvailable) {
    diagnostics.push({ level: "ERROR", message: "Virtual board is not available for flashing." });
  }
  if (input.boardCurrentlyFlashing) {
    diagnostics.push({ level: "ERROR", message: "Virtual board is already flashing." });
  }
  diagnostics.push({ level: "INFO", message: "Debug interface: VIRTUAL DEBUG INTERFACE" });
  return diagnostics;
}

export function isFlashValid(diagnostics: BuildDiagnostic[]): boolean {
  return !diagnostics.some((d) => d.level === "ERROR");
}

export function nextFlashStage(current: FlashStage, isValid: boolean): FlashStage {
  if (current === "IDLE") return "CONNECTING";
  if (current === "SUCCESS" || current === "FAILED") return current;

  if (current === "CONNECTING" && !isValid) return "FAILED";

  const idx = STAGED_SEQUENCE.indexOf(current);
  if (idx === STAGED_SEQUENCE.length - 1) {
    return isValid ? "SUCCESS" : "FAILED";
  }
  return STAGED_SEQUENCE[idx + 1];
}

export function flashOutputLine(stage: FlashStage): string {
  switch (stage) {
    case "CONNECTING":
      return "[INFO] Connecting to VIRTUAL DEBUG INTERFACE";
    case "ERASING":
      return "[INFO] Erasing virtual board flash region";
    case "PROGRAMMING":
      return "[INFO] Programming virtual firmware image";
    case "VERIFYING":
      return "[INFO] Verifying programmed image";
    case "SUCCESS":
      return "[INFO] Flash completed successfully";
    case "FAILED":
      return "[ERROR] Flash failed — see diagnostics above";
    default:
      return "";
  }
}
