/**
 * Office world layout data — a fictionalised, generic professional
 * IT/embedded office suitable for a public portfolio (see
 * docs/PRIVACY_REVIEW.md and docs/OFFICE_WORLD.md). Not a reproduction
 * of any real employer's floor plan.
 *
 * World scale: 1 world unit = 1 metre.
 *
 * Coordinate convention: same as the rest of the app — X is
 * left(-)/right(+), Z is south(+, toward the player's Milestone 1
 * spawn)/north(-, into the building). The building's entrance faces
 * +Z (south).
 */
import type { OfficeRoomId } from "@/config/workplace";

export interface AABB2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const BUILDING_WALL_HEIGHT = 3.2;
export const BUILDING_WALL_THICKNESS = 0.25;

/** Exterior building footprint. */
export const BUILDING_SHELL: AABB2D = { minX: -14, maxX: 14, minZ: -34, maxZ: -14 };

/** Entrance door gap centred on the south wall (z = -14). */
export const ENTRANCE_GAP: { center: number; halfWidth: number } = {
  center: 0,
  halfWidth: 1.4,
};

export type OfficeZoneId = OfficeRoomId | "exterior";

interface ZoneDefinition {
  id: OfficeZoneId;
  bounds: AABB2D;
}

/**
 * Ordered zone list — first containing match wins. More specific
 * (smaller/nested) zones are listed before the broader open-plan zones
 * they're carved out of.
 */
export const ZONE_DEFINITIONS: ZoneDefinition[] = [
  { id: "pantry", bounds: { minX: 9, maxX: 14, minZ: -19, maxZ: -14 } },
  { id: "lobby", bounds: { minX: -14, maxX: 14, minZ: -19, maxZ: -14 } },
  { id: "teamLead", bounds: { minX: -14, maxX: -8, minZ: -23, maxZ: -19 } },
  { id: "engineering", bounds: { minX: -14, maxX: 0, minZ: -27, maxZ: -19 } },
  { id: "embeddedLab", bounds: { minX: 0, maxX: 14, minZ: -27, maxZ: -19 } },
  { id: "hr", bounds: { minX: -14, maxX: -7, minZ: -34, maxZ: -27 } },
  { id: "manager", bounds: { minX: -7, maxX: 0, minZ: -34, maxZ: -27 } },
  { id: "meeting", bounds: { minX: 0, maxX: 7, minZ: -34, maxZ: -27 } },
  { id: "executive", bounds: { minX: 7, maxX: 14, minZ: -34, maxZ: -27 } },
];

/** Pure point-in-zone classification, ordered most-specific-first. */
export function resolveOfficeZone(x: number, z: number): OfficeZoneId {
  for (const zone of ZONE_DEFINITIONS) {
    const { minX, maxX, minZ, maxZ } = zone.bounds;
    if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
      return zone.id;
    }
  }
  return "exterior";
}

export function isIndoorZone(zone: OfficeZoneId): boolean {
  return zone !== "exterior";
}

export interface EnclosedRoomDefinition {
  id: OfficeRoomId;
  doorId: string;
  bounds: AABB2D;
  /** Which wall the door sits on; door gap is centred on that wall. */
  doorSide: "north" | "south" | "east" | "west";
  doorGapHalfWidth: number;
  labelPosition: [number, number, number];
}

/**
 * The four enclosed executive/HR/manager/meeting rooms plus the pantry
 * are fully walled with a door; the lobby, engineering, embedded lab,
 * and team-lead areas are open-plan (no walls) per docs/OFFICE_WORLD.md.
 */
export const ENCLOSED_ROOMS: EnclosedRoomDefinition[] = [
  {
    id: "pantry",
    doorId: "door-pantry",
    bounds: { minX: 9, maxX: 14, minZ: -19, maxZ: -14 },
    doorSide: "west",
    doorGapHalfWidth: 0.9,
    labelPosition: [11.5, 2.4, -16.5],
  },
  {
    id: "hr",
    doorId: "door-hr",
    bounds: { minX: -14, maxX: -7, minZ: -34, maxZ: -27 },
    doorSide: "north",
    doorGapHalfWidth: 0.9,
    labelPosition: [-10.5, 2.4, -33.6],
  },
  {
    id: "manager",
    doorId: "door-manager",
    bounds: { minX: -7, maxX: 0, minZ: -34, maxZ: -27 },
    doorSide: "north",
    doorGapHalfWidth: 0.9,
    labelPosition: [-3.5, 2.4, -33.6],
  },
  {
    id: "meeting",
    doorId: "door-meeting",
    bounds: { minX: 0, maxX: 7, minZ: -34, maxZ: -27 },
    doorSide: "north",
    doorGapHalfWidth: 0.9,
    labelPosition: [3.5, 2.4, -33.6],
  },
  {
    id: "executive",
    doorId: "door-executive",
    bounds: { minX: 7, maxX: 14, minZ: -34, maxZ: -27 },
    doorSide: "north",
    doorGapHalfWidth: 0.9,
    labelPosition: [10.5, 2.4, -33.6],
  },
];

export const OPEN_ZONE_LABEL_POSITIONS: Partial<Record<OfficeRoomId, [number, number, number]>> = {
  lobby: [0, 2.6, -16.5],
  engineering: [-7, 2.6, -20],
  embeddedLab: [7, 2.6, -20],
  teamLead: [-11, 2.6, -19.6],
};

/** The configured player workstation desk, inside the open engineering zone (not the team-lead carve-out). */
export const PLAYER_WORKSTATION = {
  deskPosition: [-5, 0, -22] as [number, number, number],
  /** Desk faces +Z (toward the room interior walk path). */
  deskFacing: 0,
  chairSitAnchor: { x: -5, z: -21.15, heading: Math.PI },
  standAnchor: { x: -5, z: -20.4, heading: Math.PI },
  cameraTarget: [-5, 1.15, -22.4] as [number, number, number],
  boardAnchor: [-5.35, 0.78, -22.35] as [number, number, number],
};

export const ENTRANCE_DOOR_ID = "door-entrance";
