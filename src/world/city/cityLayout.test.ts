import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_ROADS,
  CITY_TREES,
  buildCityCollisionWalls,
} from "./cityLayout";
import { BUILDING_SHELL } from "@/world/office/officeLayout";

// Office shell is z ∈ [-34, -14]; the clearance adds a margin plus the
// entrance plaza in front (toward z = -8). The south building row sits
// at maxZ = -36.5, leaving a 2.5 m gap behind the office wall.
const OFFICE_CLEARANCE = { minX: -20, maxX: 20, minZ: -36, maxZ: -8 };

describe("cityLayout", () => {
  it("has unique building ids", () => {
    const ids = CITY_BUILDINGS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every building clear of the office block and its plaza", () => {
    for (const b of CITY_BUILDINGS) {
      const half = b.footprint / 2;
      const overlaps =
        b.x + half > OFFICE_CLEARANCE.minX &&
        b.x - half < OFFICE_CLEARANCE.maxX &&
        b.z + half > OFFICE_CLEARANCE.minZ &&
        b.z - half < OFFICE_CLEARANCE.maxZ;
      expect(overlaps, `building ${b.id} overlaps the office block`).toBe(false);
    }
  });

  it("keeps every building off the road surfaces", () => {
    for (const b of CITY_BUILDINGS) {
      const half = b.footprint / 2;
      for (const road of CITY_ROADS) {
        const overlaps =
          b.x + half > road.bounds.minX &&
          b.x - half < road.bounds.maxX &&
          b.z + half > road.bounds.minZ &&
          b.z - half < road.bounds.maxZ;
        expect(overlaps, `building ${b.id} overlaps ${road.id}`).toBe(false);
      }
    }
  });

  it("keeps trees off roads and outside the office shell", () => {
    for (const t of CITY_TREES) {
      for (const road of CITY_ROADS) {
        const onRoad =
          t.x > road.bounds.minX &&
          t.x < road.bounds.maxX &&
          t.z > road.bounds.minZ &&
          t.z < road.bounds.maxZ;
        expect(onRoad, `tree ${t.id} is on ${road.id}`).toBe(false);
      }
      const inOffice =
        t.x > BUILDING_SHELL.minX &&
        t.x < BUILDING_SHELL.maxX &&
        t.z > BUILDING_SHELL.minZ &&
        t.z < BUILDING_SHELL.maxZ;
      expect(inOffice, `tree ${t.id} is inside the office`).toBe(false);
    }
  });

  it("produces one active collision wall per building matching its footprint", () => {
    const walls = buildCityCollisionWalls();
    expect(walls.length).toBe(CITY_BUILDINGS.length);
    for (const wall of walls) {
      expect(wall.active).toBe(true);
      expect(wall.bounds.maxX - wall.bounds.minX).toBeGreaterThan(0);
      expect(wall.bounds.maxZ - wall.bounds.minZ).toBeGreaterThan(0);
    }
  });
});
