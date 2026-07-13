import { ZONE_DEFINITIONS, type OfficeZoneId } from "@/world/office/officeLayout";

/**
 * Navigation strategy decision (see docs/NAVIGATION_SYSTEM.md
 * "Decision"): a hybrid zone-graph + local steering approach, not a
 * full navmesh. The office is almost entirely open-plan (Milestone 3
 * deliberately avoided full mesh collision — see docs/OFFICE_WORLD.md),
 * so a small adjacency graph between zone centers, followed by direct
 * local steering within/between adjacent zones, is enough to keep NPCs
 * off walls and out of rooms they haven't reached the door of — at a
 * fraction of the cost (and dependency weight) of baking/quering a
 * navmesh for a browser/mobile target.
 */
const ZONE_ADJACENCY: Partial<Record<OfficeZoneId, OfficeZoneId[]>> = {
  exterior: ["lobby"],
  lobby: ["exterior", "pantry", "teamLead", "engineering"],
  pantry: ["lobby"],
  teamLead: ["lobby", "engineering"],
  engineering: ["lobby", "teamLead", "embeddedLab", "hr", "manager", "meeting"],
  embeddedLab: ["engineering", "meeting", "executive"],
  hr: ["engineering"],
  manager: ["engineering"],
  meeting: ["engineering", "embeddedLab"],
  executive: ["embeddedLab"],
};

const ZONE_CENTERS: Record<OfficeZoneId, { x: number; z: number }> = Object.fromEntries(
  ZONE_DEFINITIONS.map((z) => [
    z.id,
    { x: (z.bounds.minX + z.bounds.maxX) / 2, z: (z.bounds.minZ + z.bounds.maxZ) / 2 },
  ]),
) as Record<OfficeZoneId, { x: number; z: number }>;
ZONE_CENTERS.exterior = { x: 0, z: -6 };

export function getZoneCenter(zone: OfficeZoneId): { x: number; z: number } {
  return ZONE_CENTERS[zone];
}

/**
 * BFS shortest path over the zone adjacency graph. Returns null if the
 * goal zone is unreachable from the start zone (the "unreachable
 * target" case navigation agents must handle safely).
 */
export function findZonePath(startZone: OfficeZoneId, goalZone: OfficeZoneId): OfficeZoneId[] | null {
  if (startZone === goalZone) return [startZone];

  const visited = new Set<OfficeZoneId>([startZone]);
  const queue: OfficeZoneId[][] = [[startZone]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    const neighbors = ZONE_ADJACENCY[last] ?? [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      const nextPath = [...path, neighbor];
      if (neighbor === goalZone) return nextPath;
      visited.add(neighbor);
      queue.push(nextPath);
    }
  }

  return null;
}
