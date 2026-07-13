import { describe, expect, it } from "vitest";
import { isIndoorZone, resolveOfficeZone } from "./officeLayout";

describe("resolveOfficeZone", () => {
  it("classifies a point outside the building as exterior", () => {
    expect(resolveOfficeZone(0, 0)).toBe("exterior");
  });

  it("classifies the entrance band as lobby", () => {
    expect(resolveOfficeZone(0, -16)).toBe("lobby");
  });

  it("classifies the pantry corner ahead of the broader lobby band", () => {
    expect(resolveOfficeZone(11, -16)).toBe("pantry");
  });

  it("classifies the team-lead corner ahead of the broader engineering band", () => {
    expect(resolveOfficeZone(-12, -21)).toBe("teamLead");
  });

  it("classifies the open engineering desks", () => {
    expect(resolveOfficeZone(-5, -22)).toBe("engineering");
  });

  it("classifies the embedded lab", () => {
    expect(resolveOfficeZone(7, -22)).toBe("embeddedLab");
  });

  it("classifies each enclosed executive-row room", () => {
    expect(resolveOfficeZone(-10, -30)).toBe("hr");
    expect(resolveOfficeZone(-3, -30)).toBe("manager");
    expect(resolveOfficeZone(3, -30)).toBe("meeting");
    expect(resolveOfficeZone(10, -30)).toBe("executive");
  });
});

describe("isIndoorZone", () => {
  it("treats exterior as outdoor", () => {
    expect(isIndoorZone("exterior")).toBe(false);
  });

  it("treats every office room as indoor", () => {
    expect(isIndoorZone("lobby")).toBe(true);
    expect(isIndoorZone("embeddedLab")).toBe(true);
  });
});
