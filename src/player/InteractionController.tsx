"use client";

import { useFrame } from "@react-three/fiber";
import type { InputState } from "@/engine/input/InputManager";
import type { PlayerTransform } from "./playerMovement";
import { selectBestInteractable } from "@/engine/interaction/InteractionSystem";
import { useOfficeStore } from "@/state/useOfficeStore";
import { useOfficeInteractables } from "@/world/office/useOfficeRuntime";
import { isPointBlocked, type CollisionWall } from "@/world/office/collision";
import { PLAYER_WORKSTATION } from "@/world/office/officeLayout";
import { PLAYER_RADIUS } from "./PlayerConfig";

/**
 * Runtime interaction resolver. Desktop: E (InputState.interactPressed)
 * resolves whatever the nearest valid contextual target is (door open/
 * close, sit, use/exit workstation). Standing up is a dedicated F
 * shortcut (InputState.sitTogglePressed) rather than routed through the
 * same nearest-target selection, since while seated the player's own
 * chair is unambiguous — see docs/INTERACTION_SYSTEM.md.
 */
export function InteractionController({
  getInputState,
  getPlayerTransform,
  collisionWalls,
}: {
  getInputState: () => InputState;
  getPlayerTransform: () => PlayerTransform;
  collisionWalls: CollisionWall[];
}) {
  const candidates = useOfficeInteractables();
  const chair = useOfficeStore((s) => s.chair);
  const setInteractionPrompt = useOfficeStore((s) => s.setInteractionPrompt);
  const dispatchDoorEvent = useOfficeStore((s) => s.dispatchDoorEvent);
  const beginSit = useOfficeStore((s) => s.beginSit);
  const beginStand = useOfficeStore((s) => s.beginStand);
  const enterWorkstation = useOfficeStore((s) => s.enterWorkstation);
  const exitWorkstationMode = useOfficeStore((s) => s.exitWorkstationMode);

  useFrame(() => {
    const player = getPlayerTransform();
    const best = selectBestInteractable(player, candidates);

    const currentPrompt = useOfficeStore.getState().interactionPrompt;
    if (best?.id !== currentPrompt?.id || best?.intent !== currentPrompt?.intent) {
      setInteractionPrompt(best);
    }

    const input = getInputState();

    if (input.interactPressed && best) {
      switch (best.intent) {
        case "OPEN_DOOR":
          dispatchDoorEvent(best.id, "REQUEST_OPEN");
          break;
        case "CLOSE_DOOR":
          dispatchDoorEvent(best.id, "REQUEST_CLOSE");
          break;
        case "SIT_AT_CHAIR":
          beginSit(PLAYER_WORKSTATION.chairSitAnchor);
          break;
        case "USE_WORKSTATION":
          enterWorkstation();
          break;
        case "EXIT_WORKSTATION":
          exitWorkstationMode();
          break;
        case "STAND_FROM_CHAIR":
          break;
      }
    }

    if (input.sitTogglePressed && chair.playerState === "SEATED") {
      const target = PLAYER_WORKSTATION.standAnchor;
      const blocked = isPointBlocked({ x: target.x, z: target.z }, PLAYER_RADIUS, collisionWalls);
      if (!blocked) {
        beginStand(target);
      }
    }
  });

  return null;
}
