"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InputState } from "@/engine/input/InputManager";
import { computeNextPlayerTransform, type PlayerTransform } from "./playerMovement";
import { nextAnimationState, type PlayerAnimationState } from "./animationState";
import { PLAYER_CAPSULE_HEIGHT, PLAYER_RADIUS, SEAT_TRANSITION_DURATION_SEC } from "./PlayerConfig";
import { resolveWallCollisions, type CollisionWall } from "@/world/office/collision";
import { useOfficeStore } from "@/state/useOfficeStore";
import { useNpcStore } from "@/state/useNpcStore";

export function PlayerCapsule({
  getInputState,
  collisionWalls = [],
  onTransformChange,
  onAnimationStateChange,
}: {
  getInputState: () => InputState;
  collisionWalls?: CollisionWall[];
  onTransformChange?: (t: PlayerTransform) => void;
  onAnimationStateChange?: (s: PlayerAnimationState) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const animStateRef = useRef<PlayerAnimationState>("IDLE");
  const seatAnchorRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const transitionStartRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const transitionElapsedRef = useRef(0);

  const locomotionState = useOfficeStore((s) => s.chair.playerState);
  const dialogueActive = useNpcStore((s) => s.dialogue !== null);
  const pendingTransition = useOfficeStore((s) => s.pendingTransition);
  const storeAnimationState = useOfficeStore((s) => s.playerAnimationState);
  const completeSitTransition = useOfficeStore((s) => s.completeSitTransition);
  const completeStandTransition = useOfficeStore((s) => s.completeStandTransition);

  useEffect(() => {
    if (!pendingTransition) return;
    transitionStartRef.current = { ...transformRef.current };
    transitionElapsedRef.current = 0;
    if (pendingTransition.kind === "toSit") {
      seatAnchorRef.current = { ...pendingTransition.target };
    }
  }, [pendingTransition]);

  useFrame((_, dt) => {
    if (locomotionState === "NORMAL" && dialogueActive) {
      // Dialogue (Milestone 5) suspends movement even while standing
      // (not seated) — input is not consumed, and since the animation
      // state machine has no TALK state yet, the documented fallback is
      // to hold IDLE (see docs/DIALOGUE_SYSTEM.md "Player animation
      // during dialogue").
      const nextAnim = nextAnimationState(animStateRef.current, false, false);
      if (nextAnim !== animStateRef.current) {
        animStateRef.current = nextAnim;
        onAnimationStateChange?.(nextAnim);
      }
    } else if (locomotionState === "NORMAL") {
      const input = getInputState();
      const next = computeNextPlayerTransform(transformRef.current, input, dt);
      const resolved = resolveWallCollisions(next, PLAYER_RADIUS, collisionWalls);
      transformRef.current = { x: resolved.x, z: resolved.z, heading: next.heading };

      const hasMoveInput = input.moveX !== 0 || input.moveY !== 0;
      const nextAnim = nextAnimationState(animStateRef.current, hasMoveInput, input.running);
      if (nextAnim !== animStateRef.current) {
        animStateRef.current = nextAnim;
        onAnimationStateChange?.(nextAnim);
      }
    } else if (locomotionState === "TRANSITIONING" && pendingTransition) {
      transitionElapsedRef.current += dt;
      const t = Math.min(1, transitionElapsedRef.current / SEAT_TRANSITION_DURATION_SEC);
      const start = transitionStartRef.current;
      const target = pendingTransition.target;
      transformRef.current = {
        x: THREE.MathUtils.lerp(start.x, target.x, t),
        z: THREE.MathUtils.lerp(start.z, target.z, t),
        heading: dampAngleLerp(start.heading, target.heading, t),
      };
      if (animStateRef.current !== storeAnimationState) {
        animStateRef.current = storeAnimationState;
        onAnimationStateChange?.(storeAnimationState);
      }
      if (t >= 1) {
        if (pendingTransition.kind === "toSit") completeSitTransition();
        else completeStandTransition();
      }
    } else if (locomotionState === "SEATED") {
      transformRef.current = { ...seatAnchorRef.current };
      if (animStateRef.current !== storeAnimationState) {
        animStateRef.current = storeAnimationState;
        onAnimationStateChange?.(storeAnimationState);
      }
    }

    // Every state reachable while the player remains physically seated
    // (Milestone 3 sit/stand plus Milestone 4 workstation-activity
    // states, all of which only exist as children of SITTING in
    // animationState.ts) uses the same lowered/scaled seated visual.
    const seatedVisual =
      animStateRef.current === "SITTING" ||
      animStateRef.current === "SIT_DOWN" ||
      animStateRef.current === "STAND_UP" ||
      animStateRef.current === "TYPE" ||
      animStateRef.current === "DEBUG" ||
      animStateRef.current === "INSPECT_BOARD" ||
      animStateRef.current === "CELEBRATE";

    if (groupRef.current) {
      groupRef.current.position.set(
        transformRef.current.x,
        seatedVisual ? PLAYER_CAPSULE_HEIGHT / 2 - 0.35 : PLAYER_CAPSULE_HEIGHT / 2,
        transformRef.current.z,
      );
      groupRef.current.rotation.y = transformRef.current.heading;
      groupRef.current.scale.y = seatedVisual ? 0.72 : 1;
    }
    onTransformChange?.(transformRef.current);
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_CAPSULE_HEIGHT - 0.7, 4, 8]} />
        <meshStandardMaterial color="#4f7cff" />
      </mesh>
      <mesh position={[0, PLAYER_CAPSULE_HEIGHT / 2 - 0.15, 0.32]}>
        <boxGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color="#0b0d10" />
      </mesh>
    </group>
  );
}

function dampAngleLerp(a: number, b: number, t: number): number {
  let delta = b - a;
  delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + delta * t;
}
