import { useMemo } from "react";
import { useNpcStore } from "@/state/useNpcStore";
import { NPC_PROFILES } from "./npcContent";
import type { InteractableDescriptor } from "@/engine/interaction/InteractionSystem";

const TALKABLE_STATES = new Set(["IDLE", "WALKING", "SITTING", "WORKING", "TYPING", "THINKING", "BREAK"]);

/**
 * Builds the current frame's TALK_TO_NPC interaction candidates —
 * mirrors useOfficeInteractables' shape so InteractionController can
 * simply concatenate both candidate lists before selection. Only NPCs
 * whose state is in the same "interruptible" set the NPC state machine
 * itself enforces (see npcState.ts) are offered — matches "validate...
 * NPC state" and "do not allow conversation through walls" (radius is
 * tuned short enough that a wall between rooms puts an NPC out of range).
 */
export function useNpcInteractables(): InteractableDescriptor[] {
  const npcs = useNpcStore((s) => s.npcs);
  const activeNpcIds = useNpcStore((s) => s.activeNpcIds);
  const dialogueActive = useNpcStore((s) => s.dialogue !== null);

  return useMemo(() => {
    if (dialogueActive) return [];

    const candidates: InteractableDescriptor[] = [];
    for (const npcId of activeNpcIds) {
      const runtime = npcs[npcId];
      if (!runtime || !TALKABLE_STATES.has(runtime.npcState)) continue;
      const profile = NPC_PROFILES.find((p) => p.id === npcId);
      if (!profile) continue;

      candidates.push({
        id: npcId,
        x: runtime.agent.x,
        z: runtime.agent.z,
        intent: "TALK_TO_NPC",
        label: `Talk to ${profile.displayName}`,
        radius: 2.2,
        enabled: true,
      });
    }
    return candidates;
  }, [npcs, activeNpcIds, dialogueActive]);
}
