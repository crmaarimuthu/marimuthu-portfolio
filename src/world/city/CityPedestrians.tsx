"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PersonAvatar } from "@/characters/avatar/PersonAvatar";
import { pickTintColor } from "@/characters/avatar/avatarConfig";
import { advanceAlongLoop, type LoopPoint } from "./pathLoop";

/**
 * Ambient city pedestrians walking sidewalk loops, using the same
 * licensed Renderpeople avatars as the office NPCs (see
 * docs/ASSET_PIPELINE.md). Walkers all use the "nathan" variant (its
 * one baked clip is a walk cycle); a few stationary "sophia" instances
 * (idle clip) stand at the plaza/bus-stop spots — mixing variants the
 * other way round would visibly glide, see docs/NPC_SYSTEM.md "Avatar
 * variation".
 */

// Sidewalk loops (from cityLayout.ts sidewalk strips).
const MAIN_SIDEWALK_LOOP: LoopPoint[] = [
  { x: -54, z: -1.5 },
  { x: 54, z: -1.5 },
  { x: 54, z: 9.5 },
  { x: -54, z: 9.5 },
];

const NORTH_SIDEWALK_LOOP: LoopPoint[] = [
  { x: -54, z: 46.5 },
  { x: 54, z: 46.5 },
  { x: 54, z: 57.5 },
  { x: -54, z: 57.5 },
];

const WALK_SPEED = 1.5; // m/s, matches a casual walk

interface WalkerDefinition {
  id: string;
  loop: LoopPoint[];
  startOffset: number;
}

const WALKERS: WalkerDefinition[] = [
  { id: "ped-0", loop: MAIN_SIDEWALK_LOOP, startOffset: 0 },
  { id: "ped-1", loop: MAIN_SIDEWALK_LOOP, startOffset: 45 },
  { id: "ped-2", loop: MAIN_SIDEWALK_LOOP, startOffset: 90 },
  { id: "ped-3", loop: MAIN_SIDEWALK_LOOP, startOffset: 150 },
  { id: "ped-4", loop: NORTH_SIDEWALK_LOOP, startOffset: 20 },
  { id: "ped-5", loop: NORTH_SIDEWALK_LOOP, startOffset: 80 },
  { id: "ped-6", loop: NORTH_SIDEWALK_LOOP, startOffset: 140 },
  { id: "ped-7", loop: NORTH_SIDEWALK_LOOP, startOffset: 200 },
];

/** Stationary people (sophia's idle clip) at plaza spots. */
const STANDERS: Array<{ id: string; x: number; z: number; heading: number }> = [
  { id: "stand-0", x: -10, z: -2, heading: Math.PI },
  { id: "stand-1", x: 24, z: 9.8, heading: 0 },
  { id: "stand-2", x: -34, z: 9.8, heading: Math.PI / 3 },
];

export function CityPedestrians({ walkerCount = WALKERS.length }: { walkerCount?: number }) {
  const walkers = WALKERS.slice(0, walkerCount);
  return (
    <group>
      {walkers.map((walker) => (
        <Walker key={walker.id} definition={walker} />
      ))}
      {STANDERS.map((s) => (
        <group key={s.id} position={[s.x, 0, s.z]} rotation={[0, s.heading, 0]}>
          <PersonAvatar variant="sophia" getIsMoving={() => false} tintColor={pickTintColor(s.id)} />
        </group>
      ))}
    </group>
  );
}

function Walker({ definition }: { definition: WalkerDefinition }) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  useFrame((_, dt) => {
    elapsedRef.current += dt;
    const pose = advanceAlongLoop(
      definition.loop,
      definition.startOffset + elapsedRef.current * WALK_SPEED,
    );
    if (groupRef.current) {
      groupRef.current.position.set(pose.x, 0, pose.z);
      groupRef.current.rotation.y = pose.heading;
    }
  });

  return (
    <group ref={groupRef}>
      <PersonAvatar
        variant="nathan"
        getIsMoving={() => true}
        tintColor={pickTintColor(definition.id)}
      />
    </group>
  );
}
