"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InputManager } from "@/engine/input/InputManager";
import { computeNextPlayerTransform, type PlayerTransform } from "./playerMovement";
import { nextAnimationState, type PlayerAnimationState } from "./animationState";

const CAPSULE_HEIGHT = 1.7;

export function PlayerCapsule({
  inputManager,
  onTransformChange,
  onAnimationStateChange,
}: {
  inputManager: InputManager;
  onTransformChange?: (t: PlayerTransform) => void;
  onAnimationStateChange?: (s: PlayerAnimationState) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const animStateRef = useRef<PlayerAnimationState>("IDLE");

  useFrame((_, dt) => {
    const input = inputManager.consumeFrameState();
    const next = computeNextPlayerTransform(transformRef.current, input, dt);
    transformRef.current = next;

    const hasMoveInput = input.moveX !== 0 || input.moveY !== 0;
    const nextAnim = nextAnimationState(animStateRef.current, hasMoveInput, input.running);
    if (nextAnim !== animStateRef.current) {
      animStateRef.current = nextAnim;
      onAnimationStateChange?.(nextAnim);
    }

    if (groupRef.current) {
      groupRef.current.position.set(next.x, CAPSULE_HEIGHT / 2, next.z);
      groupRef.current.rotation.y = next.heading;
    }
    onTransformChange?.(next);
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <capsuleGeometry args={[0.35, CAPSULE_HEIGHT - 0.7, 4, 8]} />
        <meshStandardMaterial color="#4f7cff" />
      </mesh>
      <mesh position={[0, CAPSULE_HEIGHT / 2 - 0.15, 0.32]}>
        <boxGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color="#0b0d10" />
      </mesh>
    </group>
  );
}
