import {
  BUILDING_SHELL,
  BUILDING_WALL_THICKNESS,
  ENCLOSED_ROOMS,
  ENTRANCE_GAP,
  ENTRANCE_DOOR_ID,
  type AABB2D,
} from "./officeLayout";

export interface WallSegmentDef {
  id: string;
  bounds: AABB2D;
  /** Present only on the segment that represents a door gap. */
  doorId?: string;
}

const T = BUILDING_WALL_THICKNESS;

function northSouthWalls(
  idPrefix: string,
  bounds: AABB2D,
  side: "north" | "south",
  gapCenter: number,
  gapHalfWidth: number,
  doorId: string,
): WallSegmentDef[] {
  const z = side === "north" ? bounds.minZ : bounds.maxZ;
  const zMin = z - T / 2;
  const zMax = z + T / 2;
  const gapMin = gapCenter - gapHalfWidth;
  const gapMax = gapCenter + gapHalfWidth;

  return [
    { id: `${idPrefix}-left`, bounds: { minX: bounds.minX - T, maxX: gapMin, minZ: zMin, maxZ: zMax } },
    { id: `${idPrefix}-right`, bounds: { minX: gapMax, maxX: bounds.maxX + T, minZ: zMin, maxZ: zMax } },
    { id: `${idPrefix}-door`, bounds: { minX: gapMin, maxX: gapMax, minZ: zMin, maxZ: zMax }, doorId },
  ];
}

function eastWestWalls(
  idPrefix: string,
  bounds: AABB2D,
  side: "east" | "west",
  gapCenter: number,
  gapHalfWidth: number,
  doorId: string,
): WallSegmentDef[] {
  const x = side === "west" ? bounds.minX : bounds.maxX;
  const xMin = x - T / 2;
  const xMax = x + T / 2;
  const gapMin = gapCenter - gapHalfWidth;
  const gapMax = gapCenter + gapHalfWidth;

  return [
    { id: `${idPrefix}-near`, bounds: { minX: xMin, maxX: xMax, minZ: bounds.minZ - T, maxZ: gapMin } },
    { id: `${idPrefix}-far`, bounds: { minX: xMin, maxX: xMax, minZ: gapMax, maxZ: bounds.maxZ + T } },
    { id: `${idPrefix}-door`, bounds: { minX: xMin, maxX: xMax, minZ: gapMin, maxZ: gapMax }, doorId },
  ];
}

function plainWall(id: string, bounds: AABB2D): WallSegmentDef {
  return { id, bounds };
}

/**
 * Builds the static list of wall segments for the exterior shell and
 * every enclosed room. Segments tagged with `doorId` represent a door
 * opening and should only be treated as blocking while that door is not
 * fully OPEN (see doorState.ts / collision.ts).
 */
export function buildOfficeWallSegments(): WallSegmentDef[] {
  const segments: WallSegmentDef[] = [];

  // Exterior shell: south wall has the entrance gap; other three sides are solid.
  segments.push(
    ...northSouthWalls(
      "shell-south",
      BUILDING_SHELL,
      "south",
      ENTRANCE_GAP.center,
      ENTRANCE_GAP.halfWidth,
      ENTRANCE_DOOR_ID,
    ),
  );
  segments.push(plainWall("shell-north", { minX: BUILDING_SHELL.minX - T, maxX: BUILDING_SHELL.maxX + T, minZ: BUILDING_SHELL.minZ - T / 2, maxZ: BUILDING_SHELL.minZ + T / 2 }));
  segments.push(plainWall("shell-west", { minX: BUILDING_SHELL.minX - T / 2, maxX: BUILDING_SHELL.minX + T / 2, minZ: BUILDING_SHELL.minZ - T, maxZ: BUILDING_SHELL.maxZ + T }));
  segments.push(plainWall("shell-east", { minX: BUILDING_SHELL.maxX - T / 2, maxX: BUILDING_SHELL.maxX + T / 2, minZ: BUILDING_SHELL.minZ - T, maxZ: BUILDING_SHELL.maxZ + T }));

  for (const room of ENCLOSED_ROOMS) {
    const gapCenter =
      room.doorSide === "north" || room.doorSide === "south"
        ? (room.bounds.minX + room.bounds.maxX) / 2
        : (room.bounds.minZ + room.bounds.maxZ) / 2;

    if (room.doorSide === "north" || room.doorSide === "south") {
      segments.push(
        ...northSouthWalls(
          `${room.id}-${room.doorSide}`,
          room.bounds,
          room.doorSide,
          gapCenter,
          room.doorGapHalfWidth,
          room.doorId,
        ),
      );
    } else {
      segments.push(
        ...eastWestWalls(
          `${room.id}-${room.doorSide}`,
          room.bounds,
          room.doorSide,
          gapCenter,
          room.doorGapHalfWidth,
          room.doorId,
        ),
      );
    }

    // Remaining three solid walls of the room.
    if (room.doorSide !== "north") {
      segments.push(plainWall(`${room.id}-north`, { minX: room.bounds.minX - T, maxX: room.bounds.maxX + T, minZ: room.bounds.minZ - T / 2, maxZ: room.bounds.minZ + T / 2 }));
    }
    if (room.doorSide !== "south") {
      segments.push(plainWall(`${room.id}-south`, { minX: room.bounds.minX - T, maxX: room.bounds.maxX + T, minZ: room.bounds.maxZ - T / 2, maxZ: room.bounds.maxZ + T / 2 }));
    }
    if (room.doorSide !== "west") {
      segments.push(plainWall(`${room.id}-west`, { minX: room.bounds.minX - T / 2, maxX: room.bounds.minX + T / 2, minZ: room.bounds.minZ - T, maxZ: room.bounds.maxZ + T }));
    }
    if (room.doorSide !== "east") {
      segments.push(plainWall(`${room.id}-east`, { minX: room.bounds.maxX - T / 2, maxX: room.bounds.maxX + T / 2, minZ: room.bounds.minZ - T, maxZ: room.bounds.maxZ + T }));
    }
  }

  return segments;
}
