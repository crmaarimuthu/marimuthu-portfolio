import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPersistedQualityOverride,
  persistQualityOverride,
  readPersistedQualityOverride,
  selectInitialQualityLevel,
} from "./quality";

describe("selectInitialQualityLevel", () => {
  it("selects LOW for low-memory mobile devices", () => {
    const level = selectInitialQualityLevel({
      deviceMemoryGB: 2,
      hardwareConcurrency: 4,
      isMobileUserAgent: true,
      viewportWidth: 375,
    });
    expect(level).toBe("LOW");
  });

  it("selects MEDIUM for typical mobile devices", () => {
    const level = selectInitialQualityLevel({
      deviceMemoryGB: 4,
      hardwareConcurrency: 6,
      isMobileUserAgent: true,
      viewportWidth: 780,
    });
    expect(level).toBe("MEDIUM");
  });

  it("selects ULTRA for high-end desktops", () => {
    const level = selectInitialQualityLevel({
      deviceMemoryGB: 16,
      hardwareConcurrency: 16,
      isMobileUserAgent: false,
      viewportWidth: 2560,
    });
    expect(level).toBe("ULTRA");
  });

  it("selects LOW for low-end desktops", () => {
    const level = selectInitialQualityLevel({
      deviceMemoryGB: 2,
      hardwareConcurrency: 2,
      isMobileUserAgent: false,
      viewportWidth: 1280,
    });
    expect(level).toBe("LOW");
  });

  it("does not select ULTRA purely because of a high-resolution viewport", () => {
    const level = selectInitialQualityLevel({
      deviceMemoryGB: 2,
      hardwareConcurrency: 2,
      isMobileUserAgent: false,
      viewportWidth: 3840,
    });
    expect(level).toBe("LOW");
  });
});

describe("quality override persistence", () => {
  beforeEach(() => {
    clearPersistedQualityOverride();
  });

  it("returns null when no override has been persisted", () => {
    expect(readPersistedQualityOverride()).toBeNull();
  });

  it("round-trips a persisted override", () => {
    persistQualityOverride("HIGH");
    expect(readPersistedQualityOverride()).toBe("HIGH");
  });

  it("clears a persisted override", () => {
    persistQualityOverride("ULTRA");
    clearPersistedQualityOverride();
    expect(readPersistedQualityOverride()).toBeNull();
  });

  it("ignores corrupted storage values", () => {
    window.localStorage.setItem("portfolio.qualityOverride", "NOT_A_LEVEL");
    expect(readPersistedQualityOverride()).toBeNull();
  });
});
