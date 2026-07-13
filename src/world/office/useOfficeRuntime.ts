import { useMemo } from "react";
import { useOfficeStore } from "@/state/useOfficeStore";
import { isDoorTraversable } from "./doorState";
import { buildOfficeWallSegments } from "./wallSegments";
import { ENCLOSED_ROOMS, ENTRANCE_DOOR_ID, ENTRANCE_GAP, BUILDING_SHELL, PLAYER_WORKSTATION } from "./officeLayout";
import type { CollisionWall } from "./collision";
import type { InteractableDescriptor } from "@/engine/interaction/InteractionSystem";

const STATIC_WALL_SEGMENTS = buildOfficeWallSegments();

function doorGapPosition(doorId: string): { x: number; z: number } {
  if (doorId === ENTRANCE_DOOR_ID) {
    return { x: ENTRANCE_GAP.center, z: BUILDING_SHELL.maxZ };
  }
  const room = ENCLOSED_ROOMS.find((r) => r.doorId === doorId)!;
  const { bounds, doorSide } = room;
  if (doorSide === "north" || doorSide === "south") {
    return { x: (bounds.minX + bounds.maxX) / 2, z: doorSide === "north" ? bounds.minZ : bounds.maxZ };
  }
  return { x: doorSide === "west" ? bounds.minX : bounds.maxX, z: (bounds.minZ + bounds.maxZ) / 2 };
}

function roomLabelFor(doorId: string): string {
  if (doorId === ENTRANCE_DOOR_ID) return "Door";
  return ENCLOSED_ROOMS.find((r) => r.doorId === doorId)?.id ?? "Door";
}

/** Recomputes the active-collision wall list whenever door states change. */
export function useOfficeCollisionWalls(): CollisionWall[] {
  const doorStates = useOfficeStore((s) => s.doorStates);

  return useMemo(
    () =>
      STATIC_WALL_SEGMENTS.map((segment): CollisionWall => ({
        id: segment.id,
        bounds: segment.bounds,
        active: segment.doorId ? !isDoorTraversable(doorStates[segment.doorId] ?? "CLOSED") : true,
      })),
    [doorStates],
  );
}

const ALL_DOOR_IDS = [ENTRANCE_DOOR_ID, ...ENCLOSED_ROOMS.map((r) => r.doorId)];

/**
 * Builds the current frame's interaction candidate list: doors (open/
 * close), the workstation chair (sit only — standing is a dedicated F
 * shortcut, see docs/INTERACTION_SYSTEM.md), and USE/EXIT_WORKSTATION.
 */
export function useOfficeInteractables(): InteractableDescriptor[] {
  const doorStates = useOfficeStore((s) => s.doorStates);
  const chair = useOfficeStore((s) => s.chair);
  const workstation = useOfficeStore((s) => s.workstation);

  return useMemo(() => {
    const candidates: InteractableDescriptor[] = [];

    for (const doorId of ALL_DOOR_IDS) {
      const state = doorStates[doorId] ?? "CLOSED";
      const { x, z } = doorGapPosition(doorId);
      if (state === "CLOSED") {
        candidates.push({ id: doorId, x, z, intent: "OPEN_DOOR", label: `Open ${roomLabelFor(doorId)}`, radius: 2.2, enabled: true });
      } else if (state === "OPEN") {
        candidates.push({ id: doorId, x, z, intent: "CLOSE_DOOR", label: `Close ${roomLabelFor(doorId)}`, radius: 2.2, enabled: true });
      }
    }

    const seated = chair.playerState === "SEATED";
    const chairEnabled = chair.chairState === "AVAILABLE" && chair.playerState === "NORMAL";
    if (!seated) {
      candidates.push({
        id: "chair-workstation",
        x: PLAYER_WORKSTATION.chairSitAnchor.x,
        z: PLAYER_WORKSTATION.chairSitAnchor.z,
        intent: "SIT_AT_CHAIR",
        label: "Sit",
        radius: 1.4,
        enabled: chairEnabled,
      });
    } else {
      candidates.push({
        id: "workstation",
        x: PLAYER_WORKSTATION.chairSitAnchor.x,
        z: PLAYER_WORKSTATION.chairSitAnchor.z,
        intent: workstation.mode === "ACTIVE" ? "EXIT_WORKSTATION" : "USE_WORKSTATION",
        label: workstation.mode === "ACTIVE" ? "Exit Workstation" : "Use Workstation",
        radius: 1.4,
        enabled: true,
      });
    }

    return candidates;
  }, [doorStates, chair, workstation]);
}
