"use client";

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useNpcStore } from "@/state/useNpcStore";
import { NPC_PROFILES } from "@/characters/npc/npcContent";
import { NPCInstance } from "./NPCInstance";
import type { QualityLevel } from "@/config/quality";

/**
 * Ticks the NPC behaviour/navigation simulation once per frame and
 * renders every currently-budgeted NPC. Density scaling
 * (docs/NPC_SYSTEM.md "Density scaling") is applied via
 * `setActiveBudget`, driven by the active QualityLevel — LOW spawns no
 * NPCs at all, MEDIUM/HIGH/ULTRA spawn progressively more of the fixed
 * roster (see config/quality.ts `npcBudget`).
 */
export function OfficeNpcPopulation({ qualityLevel }: { qualityLevel: QualityLevel }) {
  const activeNpcIds = useNpcStore((s) => s.activeNpcIds);
  const setActiveBudget = useNpcStore((s) => s.setActiveBudget);
  const tick = useNpcStore((s) => s.tick);

  useEffect(() => {
    setActiveBudget(qualityLevel);
  }, [qualityLevel, setActiveBudget]);

  useFrame((_, dt) => {
    tick(dt);
  });

  return (
    <>
      {activeNpcIds.map((npcId) => {
        const profile = NPC_PROFILES.find((p) => p.id === npcId);
        if (!profile) return null;
        return <NPCInstance key={npcId} npcId={npcId} role={profile.role} displayName={profile.displayName} />;
      })}
    </>
  );
}
