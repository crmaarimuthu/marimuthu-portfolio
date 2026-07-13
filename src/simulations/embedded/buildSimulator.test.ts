import { describe, expect, it } from "vitest";
import { DEMO_FIRMWARE_PROJECT, type FirmwareProject } from "./FirmwareProject";
import { isBuildValid, nextBuildStage, validateFirmwareProject } from "./buildSimulator";

describe("validateFirmwareProject", () => {
  it("produces no ERROR diagnostics for the demo project", () => {
    const diagnostics = validateFirmwareProject(DEMO_FIRMWARE_PROJECT);
    expect(isBuildValid(diagnostics)).toBe(true);
  });

  it("errors when there is no project", () => {
    const diagnostics = validateFirmwareProject(null);
    expect(isBuildValid(diagnostics)).toBe(false);
  });

  it("errors when main() is missing", () => {
    const broken: FirmwareProject = {
      ...DEMO_FIRMWARE_PROJECT,
      sourceFiles: [{ path: "main.c", content: "// no entry point here" }],
    };
    const diagnostics = validateFirmwareProject(broken);
    expect(isBuildValid(diagnostics)).toBe(false);
    expect(diagnostics.some((d) => d.message.includes("entry point"))).toBe(true);
  });

  it("errors on an invalid blink interval (deterministic configured failure)", () => {
    const broken: FirmwareProject = {
      ...DEMO_FIRMWARE_PROJECT,
      expectedBehaviour: { type: "GPIO_BLINK", pin: 5, intervalMs: 0 },
    };
    const diagnostics = validateFirmwareProject(broken);
    expect(isBuildValid(diagnostics)).toBe(false);
  });

  it("errors on a negative GPIO pin", () => {
    const broken: FirmwareProject = {
      ...DEMO_FIRMWARE_PROJECT,
      expectedBehaviour: { type: "GPIO_BLINK", pin: -1, intervalMs: 500 },
    };
    expect(isBuildValid(validateFirmwareProject(broken))).toBe(false);
  });
});

describe("nextBuildStage", () => {
  it("progresses IDLE -> VALIDATING -> COMPILING -> LINKING -> SUCCESS when valid", () => {
    let stage = nextBuildStage("IDLE", true);
    expect(stage).toBe("VALIDATING");
    stage = nextBuildStage(stage, true);
    expect(stage).toBe("COMPILING");
    stage = nextBuildStage(stage, true);
    expect(stage).toBe("LINKING");
    stage = nextBuildStage(stage, true);
    expect(stage).toBe("SUCCESS");
  });

  it("fails immediately at VALIDATING when invalid", () => {
    const stage = nextBuildStage("VALIDATING", false);
    expect(stage).toBe("FAILED");
  });

  it("SUCCESS and FAILED are terminal", () => {
    expect(nextBuildStage("SUCCESS", true)).toBe("SUCCESS");
    expect(nextBuildStage("FAILED", true)).toBe("FAILED");
  });
});
