"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InputState } from "@/engine/input/InputManager";
import { computeNextPlayerTransform, type PlayerTransform } from "./playerMovement";
import { nextAnimationState, type PlayerAnimationState } from "./animationState";
import { PLAYER_RADIUS, SEAT_TRANSITION_DURATION_SEC } from "./PlayerConfig";
import { resolveWallCollisions, type CollisionWall } from "@/world/office/collision";
import { useOfficeStore } from "@/state/useOfficeStore";
import { useNpcStore } from "@/state/useNpcStore";
import { PersonAvatar } from "@/characters/avatar/PersonAvatar";

const MOVING_ANIM_STATES = new Set<PlayerAnimationState>(["WALK", "RUN"]);

/** Simple arcade-style jump — no animation clip is available (see PersonAvatar.tsx), so this is a visual hop only. */
const GRAVITY = -18; // m/s^2
const JUMP_SPEED = 6; // m/s, initial upward velocity

export function PlayerCapsule({
  getInputState,
  getCameraYaw,
  collisionWalls = [],
  onTransformChange,
  onAnimationStateChange,
  consumeTeleport,
}: {
  getInputState: () => InputState;
  getCameraYaw?: () => number;
  collisionWalls?: CollisionWall[];
  onTransformChange?: (t: PlayerTransform) => void;
  onAnimationStateChange?: (s: PlayerAnimationState) => void;
  /**
   * Polled once per frame; a non-null result repositions the player
   * instantly (used when stepping out of a vehicle — see CityVehicles).
   */
  consumeTeleport?: () => PlayerTransform | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const animStateRef = useRef<PlayerAnimationState>("IDLE");
  const seatAnchorRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const transitionStartRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const transitionElapsedRef = useRef(0);
  const isMovingRef = useRef(false);
  const jumpHeightRef = useRef(0);
  const jumpVelocityRef = useRef(0);

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
    const teleport = consumeTeleport?.();
    if (teleport) {
      transformRef.current = { ...teleport };
      jumpHeightRef.current = 0;
      jumpVelocityRef.current = 0;
    }

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
      const cameraYaw = getCameraYaw?.() ?? 0;
      const next = computeNextPlayerTransform(transformRef.current, input, dt, cameraYaw);
      const resolved = resolveWallCollisions(next, PLAYER_RADIUS, collisionWalls);
      transformRef.current = { x: resolved.x, z: resolved.z, heading: next.heading };

      const hasMoveInput = input.moveX !== 0 || input.moveY !== 0;
      const nextAnim = nextAnimationState(animStateRef.current, hasMoveInput, input.running);
      if (nextAnim !== animStateRef.current) {
        animStateRef.current = nextAnim;
        onAnimationStateChange?.(nextAnim);
      }

      // Simple arcade jump: only while grounded and not mid-interaction.
      const grounded = jumpHeightRef.current <= 0 && jumpVelocityRef.current <= 0;
      if (input.jumpPressed && grounded) {
        jumpVelocityRef.current = JUMP_SPEED;
      }
      jumpVelocityRef.current += GRAVITY * dt;
      jumpHeightRef.current += jumpVelocityRef.current * dt;
      if (jumpHeightRef.current < 0) {
        jumpHeightRef.current = 0;
        jumpVelocityRef.current = 0;
      }
    } else {
      // Landed mid-jump if a chair/dialogue interaction interrupts it.
      jumpHeightRef.current = 0;
      jumpVelocityRef.current = 0;
    }

    if (locomotionState === "TRANSITIONING" && pendingTransition) {
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

    isMovingRef.current = MOVING_ANIM_STATES.has(animStateRef.current);

    if (groupRef.current) {
      // The real-person model's root sits at the feet (ground level),
      // unlike the old capsule placeholder which was centered on the
      // body — so the group stays at y=0 (plus any jump height) rather
      // than at a half-height offset. There is no sit animation clip
      // available (see characters/avatar/PersonAvatar.tsx), so seated
      // states currently still render the character standing at the
      // seat position — a documented known limitation, not a
      // fabricated pose.
      groupRef.current.position.set(transformRef.current.x, jumpHeightRef.current, transformRef.current.z);
      groupRef.current.rotation.y = transformRef.current.heading;
    }
    onTransformChange?.(transformRef.current);
  });

  return (
    <group ref={groupRef}>
      <PersonAvatar variant="nathan" getIsMoving={() => isMovingRef.current} />
    </group>
  );
}

function dampAngleLerp(a: number, b: number, t: number): number {
  let delta = b - a;
  delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + delta * t;
}
