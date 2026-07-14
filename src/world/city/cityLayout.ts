import type { AABB2D } from "@/world/office/officeLayout";
import type { CollisionWall } from "@/world/office/collision";

/**
 * City block layout surrounding the office (office shell occupies
 * x ∈ [-14, 14], z ∈ [-34, -14] with its entrance facing +z — see
 * officeLayout.ts). All coordinates are metres in world space, matching
 * the office/player systems. The layout is deliberately data-only so it
 * can be unit-tested without any three.js/react dependency, mirroring
 * officeLayout.ts.
 *
 * Buildings use Kenney City Kit GLB models (CC0 — see
 * docs/ASSET_PIPELINE.md "Kenney asset attribution"); their world
 * footprint here is authoritative for collision, and the renderer
 * scales each model to fit this footprint.
 */

export const CITY_GROUND_SIZE = 320;

/** Road strips (driving surface). Rendered dark asphalt with lane markings. */
export interface CityRoad {
  id: string;
  bounds: AABB2D;
  /** Long axis of the road, for lane-marking orientation. */
  axis: "x" | "z";
}

export const CITY_ROADS: CityRoad[] = [
  // Main street directly in front of the office entrance plaza.
  { id: "road-main", bounds: { minX: -56, maxX: 56, minZ: 0, maxZ: 8 }, axis: "x" },
  // North parallel street.
  { id: "road-north", bounds: { minX: -56, maxX: 56, minZ: 48, maxZ: 56 }, axis: "x" },
  // South street behind the office block.
  { id: "road-south", bounds: { minX: -56, maxX: 56, minZ: -56, maxZ: -48 }, axis: "x" },
  // Connecting avenues (west / east).
  { id: "road-west", bounds: { minX: -56, maxX: -48, minZ: -56, maxZ: 56 }, axis: "z" },
  { id: "road-east", bounds: { minX: 48, maxX: 56, minZ: -56, maxZ: 56 }, axis: "z" },
];

/** Sidewalk strips (light concrete, slightly raised look). */
export const CITY_SIDEWALKS: AABB2D[] = [
  // Flanking the main street.
  { minX: -56, maxX: 56, minZ: -3, maxZ: 0 },
  { minX: -56, maxX: 56, minZ: 8, maxZ: 11 },
  // Flanking the north street.
  { minX: -56, maxX: 56, minZ: 45, maxZ: 48 },
  { minX: -56, maxX: 56, minZ: 56, maxZ: 59 },
  // Flanking the south street.
  { minX: -56, maxX: 56, minZ: -48, maxZ: -45 },
  { minX: -56, maxX: 56, minZ: -59, maxZ: -56 },
  // Flanking the west/east avenues.
  { minX: -59, maxX: -56, minZ: -59, maxZ: 59 },
  { minX: -48, maxX: -45, minZ: -45, maxZ: 45 },
  { minX: 45, maxX: 48, minZ: -45, maxZ: 45 },
  { minX: 56, maxX: 59, minZ: -59, maxZ: 59 },
];

export type CityBuildingModel =
  | "building-type-a"
  | "building-type-b"
  | "building-type-c"
  | "building-type-d"
  | "building-type-e"
  | "building-type-f"
  | "building-type-g"
  | "building-type-h"
  | "building-type-i"
  | "building-type-j";

export interface CityBuildingPlacement {
  id: string;
  model: CityBuildingModel;
  /** Footprint centre in world space. */
  x: number;
  z: number;
  /** Yaw so the facade faces its street. */
  rotationY: number;
  /** Square world footprint (metres); authoritative for collision. */
  footprint: number;
  /** Target world height (metres) the model is scaled to. */
  height: number;
}

const BUILDING_MODELS: CityBuildingModel[] = [
  "building-type-a",
  "building-type-b",
  "building-type-c",
  "building-type-d",
  "building-type-e",
  "building-type-f",
  "building-type-g",
  "building-type-h",
  "building-type-i",
  "building-type-j",
];

function pickModel(index: number): CityBuildingModel {
  return BUILDING_MODELS[index % BUILDING_MODELS.length];
}

function buildRow(
  idPrefix: string,
  count: number,
  startX: number,
  stepX: number,
  z: number,
  rotationY: number,
  modelOffset: number,
): CityBuildingPlacement[] {
  const placements: CityBuildingPlacement[] = [];
  for (let i = 0; i < count; i++) {
    placements.push({
      id: `${idPrefix}-${i}`,
      model: pickModel(i + modelOffset),
      x: startX + stepX * i,
      z,
      rotationY,
      footprint: 9,
      height: 8 + ((i + modelOffset) % 3) * 3,
    });
  }
  return placements;
}

/**
 * Building rows face their nearest street. The block containing the
 * office (x ∈ [-20, 20], z ∈ [-40, -8]) is kept clear so the office
 * building and its entrance plaza stay unobstructed.
 */
export const CITY_BUILDINGS: CityBuildingPlacement[] = [
  // North side of the main street (facing -z toward the office).
  ...buildRow("main-north", 8, -42, 12, 17, Math.PI, 0),
  // Office block neighbours (facing +z toward the main street).
  ...buildRow("office-west", 2, -40, 12, -18, 0, 3),
  ...buildRow("office-east", 2, 28, 12, -18, 0, 5),
  // South street frontage (facing +z), behind the office block.
  ...buildRow("south-row", 8, -42, 12, -41, 0, 2),
  // North street back row (facing -z).
  ...buildRow("north-row", 8, -42, 12, 65, Math.PI, 7),
];

export interface CityTree {
  id: string;
  x: number;
  z: number;
  scale: number;
}

export const CITY_TREES: CityTree[] = [
  // Main-street sidewalk trees (in the gaps between building rows).
  ...[-36, -24, -12, 12, 24, 36].map((x, i) => ({ id: `tree-main-${i}`, x, z: 12.8, scale: 1 + (i % 3) * 0.2 })),
  ...[-36, -22, 22, 36].map((x, i) => ({ id: `tree-plaza-${i}`, x, z: -4.5, scale: 1.1 })),
  // Around the office lawn.
  { id: "tree-office-a", x: -18, z: -10, scale: 1.3 },
  { id: "tree-office-b", x: 18, z: -10, scale: 1.2 },
  { id: "tree-office-c", x: -18, z: -36, scale: 1.1 },
  { id: "tree-office-d", x: 18, z: -36, scale: 1.25 },
];

/** Street lamp posts along the main and north streets (procedural meshes). */
export const CITY_STREETLIGHTS: Array<{ id: string; x: number; z: number }> = [
  ...[-48, -24, 0, 24, 48].map((x, i) => ({ id: `lamp-main-${i}`, x, z: 10.4 })),
  ...[-48, -24, 0, 24, 48].map((x, i) => ({ id: `lamp-north-${i}`, x, z: 46.4 })),
  ...[-48, -24, 0, 24, 48].map((x, i) => ({ id: `lamp-south-${i}`, x, z: -46.4 })),
];

/** One collision AABB per city building so vehicles/players can't walk through facades. */
export function buildCityCollisionWalls(): CollisionWall[] {
  return CITY_BUILDINGS.map((b) => {
    const half = b.footprint / 2;
    return {
      id: `city-${b.id}`,
      bounds: { minX: b.x - half, maxX: b.x + half, minZ: b.z - half, maxZ: b.z + half },
      active: true,
    };
  });
}

/** Keep everything inside the city ground plane. */
export const CITY_BOUNDS: AABB2D = {
  minX: -CITY_GROUND_SIZE / 2 + 2,
  maxX: CITY_GROUND_SIZE / 2 - 2,
  minZ: -CITY_GROUND_SIZE / 2 + 2,
  maxZ: CITY_GROUND_SIZE / 2 - 2,
};
