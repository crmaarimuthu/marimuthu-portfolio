import { describe, expect, it } from "vitest";
import { selectInitialQualityLevel } from "./quality";

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
});
