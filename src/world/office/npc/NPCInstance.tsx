"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useNpcStore } from "@/state/useNpcStore";
import { PersonAvatar } from "@/characters/avatar/PersonAvatar";
import { pickAvatarVariant, pickTintColor } from "@/characters/avatar/avatarConfig";
import type { NPCRole } from "@/characters/npc/npcRoles";

const LABEL_HEIGHT = 1.95;

/**
 * A single NPC's 3D representation: a real Renderpeople human model
 * (see docs/ASSET_PIPELINE.md "Renderpeople asset attribution"),
 * deterministically assigned one of the two available free-tier
 * models and a clothing tint (`pickAvatarVariant`/`pickTintColor`,
 * seeded on `npcId` so the same NPC always looks the same), plus a
 * small floating name label. Position/heading/state are read directly
 * from useNpcStore.getState() inside useFrame (not a subscribed hook
 * value) so per-frame navigation movement never triggers a React
 * re-render — same pattern as EmbeddedBoard3D's GPIO read (see
 * docs/PERFORMANCE.md).
 */
export function NPCInstance({
  npcId,
  displayName,
}: {
  npcId: string;
  /** Reserved for future role-influenced visuals (e.g. accessories); not currently used for tinting. */
  role: NPCRole;
  displayName: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const variant = useMemo(() => pickAvatarVariant(npcId), [npcId]);
  const tintColor = useMemo(() => pickTintColor(npcId), [npcId]);
  const [labelColor, setLabelColor] = useState("#e7ebef");

  useFrame(() => {
    const npc = useNpcStore.getState().npcs[npcId];
    if (!npc || !groupRef.current) return;

    // Real-person models are rooted at the feet (ground level), unlike
    // the earlier capsule placeholder — see PlayerCapsule.tsx for the
    // same grounding change. No sit animation clip is available (see
    // PersonAvatar.tsx), so seated states currently still render the
    // NPC standing at the seat position — a documented limitation.
    groupRef.current.position.set(npc.agent.x, 0, npc.agent.z);
    groupRef.current.rotation.y = npc.agent.heading;
    groupRef.current.visible = npc.npcState !== "OFF_DUTY";

    const nextLabelColor = npc.npcState === "TALKING" ? "#7fff9e" : "#e7ebef";
    if (nextLabelColor !== labelColor) setLabelColor(nextLabelColor);
  });

  return (
    <group ref={groupRef}>
      <PersonAvatar
        variant={variant}
        tintColor={tintColor}
        getIsMoving={() => useNpcStore.getState().npcs[npcId]?.npcState === "WALKING"}
      />
      <Text position={[0, LABEL_HEIGHT, 0]} fontSize={0.16} color={labelColor} anchorX="center" anchorY="middle">
        {displayName}
      </Text>
    </group>
  );
}
