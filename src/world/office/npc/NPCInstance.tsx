"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useNpcStore } from "@/state/useNpcStore";
import type { NPCRole } from "@/characters/npc/npcRoles";

const ROLE_COLOR: Record<NPCRole, string> = {
  CEO: "#e0b34c",
  HR: "#c97fe0",
  MANAGER: "#e08a4c",
  TEAM_LEAD: "#4cc2e0",
  EMBEDDED_FIRMWARE_ENGINEER: "#4ce07a",
  EMBEDDED_SYSTEMS_ENGINEER: "#4ce0b0",
  SOFTWARE_ENGINEER: "#7c9fe0",
  TEST_VALIDATION_ENGINEER: "#e0e04c",
  OFFICE_WORKER: "#9aa0a8",
};

const CAPSULE_HEIGHT = 1.65;
const SEATED_STATES = new Set(["SITTING", "WORKING", "TYPING", "THINKING", "MEETING", "BREAK"]);

/**
 * A single NPC's 3D representation: a role-colored capsule (the same
 * placeholder tier as the player — no avatar/GLB pipeline exists yet,
 * see docs/NPC_SYSTEM.md "Avatar variation") plus a small floating name
 * label. Position/heading/seated-visual are read directly from
 * useNpcStore.getState() inside useFrame (not a subscribed hook value)
 * so per-frame navigation movement never triggers a React re-render —
 * same pattern as EmbeddedBoard3D's GPIO read (see docs/PERFORMANCE.md).
 */
export function NPCInstance({
  npcId,
  role,
  displayName,
}: {
  npcId: string;
  role: NPCRole;
  displayName: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const baseColor = useRef(new THREE.Color(ROLE_COLOR[role])).current;
  const talkColor = useRef(new THREE.Color("#ffffff")).current;

  useFrame(() => {
    const npc = useNpcStore.getState().npcs[npcId];
    if (!npc || !groupRef.current) return;

    const seated = SEATED_STATES.has(npc.npcState);
    groupRef.current.position.set(npc.agent.x, seated ? CAPSULE_HEIGHT / 2 - 0.32 : CAPSULE_HEIGHT / 2, npc.agent.z);
    groupRef.current.rotation.y = npc.agent.heading;
    groupRef.current.scale.y = seated ? 0.74 : 1;
    groupRef.current.visible = npc.npcState !== "OFF_DUTY";

    if (materialRef.current) {
      const talking = npc.npcState === "TALKING";
      materialRef.current.color.copy(talking ? talkColor.clone().lerp(baseColor, 0.4) : baseColor);
      materialRef.current.emissive.copy(talking ? baseColor : new THREE.Color("#000000"));
      materialRef.current.emissiveIntensity = talking ? 0.5 : 0;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <capsuleGeometry args={[0.32, CAPSULE_HEIGHT - 0.64, 4, 8]} />
        <meshStandardMaterial ref={materialRef} color={ROLE_COLOR[role]} />
      </mesh>
      <Text position={[0, CAPSULE_HEIGHT / 2 + 0.32, 0]} fontSize={0.16} color="#e7ebef" anchorX="center" anchorY="middle">
        {displayName}
      </Text>
    </group>
  );
}
