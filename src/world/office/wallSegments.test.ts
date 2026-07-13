import { describe, expect, it } from "vitest";
import { buildOfficeWallSegments } from "./wallSegments";
import { ENCLOSED_ROOMS, ENTRANCE_DOOR_ID } from "./officeLayout";

describe("buildOfficeWallSegments", () => {
  const segments = buildOfficeWallSegments();

  it("produces a non-empty, uniquely-identified segment list", () => {
    expect(segments.length).toBeGreaterThan(0);
    const ids = segments.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes exactly one door segment per configured door", () => {
    const doorIds = segments.filter((s) => s.doorId).map((s) => s.doorId);
    expect(doorIds).toContain(ENTRANCE_DOOR_ID);
    for (const room of ENCLOSED_ROOMS) {
      expect(doorIds).toContain(room.doorId);
    }
    expect(doorIds.length).toBe(ENCLOSED_ROOMS.length + 1);
  });

  it("every segment has a well-formed (non-inverted) bounds box", () => {
    for (const segment of segments) {
      expect(segment.bounds.minX).toBeLessThanOrEqual(segment.bounds.maxX);
      expect(segment.bounds.minZ).toBeLessThanOrEqual(segment.bounds.maxZ);
    }
  });
});
