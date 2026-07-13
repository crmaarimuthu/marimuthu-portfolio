import type { FirmwareProject } from "./FirmwareProject";

export type DiagnosticLevel = "INFO" | "WARNING" | "ERROR";

export interface BuildDiagnostic {
  level: DiagnosticLevel;
  message: string;
}

export type BuildStage = "IDLE" | "VALIDATING" | "COMPILING" | "LINKING" | "SUCCESS" | "FAILED";

const STAGED_SEQUENCE: BuildStage[] = ["VALIDATING", "COMPILING", "LINKING"];

/**
 * Deterministic validation of the trusted FirmwareProject — checks
 * structural expectations (entry point present, target configured,
 * blink behaviour well-formed), never anything resembling real
 * compilation. See docs/EMBEDDED_SIMULATION.md "Simulation boundary".
 */
export function validateFirmwareProject(project: FirmwareProject | null): BuildDiagnostic[] {
  const diagnostics: BuildDiagnostic[] = [];

  if (!project) {
    diagnostics.push({ level: "ERROR", message: "No firmware project is loaded." });
    return diagnostics;
  }

  if (project.sourceFiles.length === 0) {
    diagnostics.push({ level: "ERROR", message: "Project has no source files." });
  } else if (!project.sourceFiles.some((f) => /\bint\s+main\s*\(/.test(f.content))) {
    diagnostics.push({ level: "ERROR", message: "No 'main' entry point found in source." });
  }

  if (!project.targetBoardId) {
    diagnostics.push({ level: "ERROR", message: "No target board configured." });
  }

  if (project.expectedBehaviour.type === "GPIO_BLINK") {
    if (!Number.isInteger(project.expectedBehaviour.pin) || project.expectedBehaviour.pin < 0) {
      diagnostics.push({ level: "ERROR", message: "Configured LED GPIO pin is invalid." });
    }
    if (project.expectedBehaviour.intervalMs <= 0) {
      diagnostics.push({ level: "ERROR", message: "Blink interval must be greater than zero." });
    }
  }

  diagnostics.push({ level: "INFO", message: `Project: ${project.name}` });
  diagnostics.push({ level: "INFO", message: `Language standard: ${project.standard}` });

  return diagnostics;
}

export function isBuildValid(diagnostics: BuildDiagnostic[]): boolean {
  return !diagnostics.some((d) => d.level === "ERROR");
}

/**
 * Advances the build to its next staged phase. Timing/orchestration
 * (how long each stage is shown) lives outside this pure function — see
 * useEmbeddedRuntime.ts — so this stays trivially unit-testable.
 */
export function nextBuildStage(current: BuildStage, isValid: boolean): BuildStage {
  if (current === "IDLE") return "VALIDATING";
  if (current === "SUCCESS" || current === "FAILED") return current;

  if (current === "VALIDATING" && !isValid) return "FAILED";

  const idx = STAGED_SEQUENCE.indexOf(current);
  if (idx === STAGED_SEQUENCE.length - 1) {
    return isValid ? "SUCCESS" : "FAILED";
  }
  return STAGED_SEQUENCE[idx + 1];
}

export function buildOutputLine(stage: BuildStage, project: FirmwareProject): string {
  switch (stage) {
    case "VALIDATING":
      return "[INFO] Validating firmware project (SIMULATED TOOLCHAIN)";
    case "COMPILING":
      return `[INFO] Compiling ${project.sourceFiles[0]?.path ?? "main.c"}`;
    case "LINKING":
      return "[INFO] Linking virtual firmware image";
    case "SUCCESS":
      return "[INFO] Build completed successfully";
    case "FAILED":
      return "[ERROR] Build failed — see diagnostics above";
    default:
      return "";
  }
}
