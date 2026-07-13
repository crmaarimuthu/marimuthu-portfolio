"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { InputState } from "@/engine/input/InputManager";
import type { PlayerTransform } from "./playerMovement";
import { isIndoorZone, resolveOfficeZone } from "@/world/office/officeLayout";

const OUTDOOR_DISTANCE = 4.9;
const INDOOR_DISTANCE = 3.3;
const LOOK_HEIGHT = 1.3;
const DAMPING = 6;

const DEFAULT_PITCH = THREE.MathUtils.degToRad(24);
const MIN_PITCH = THREE.MathUtils.degToRad(-15); // looking up
const MAX_PITCH = THREE.MathUtils.degToRad(75); // looking down

/** Radians of camera rotation per pixel of raw look delta (mouse movementX/Y or touch drag). */
const LOOK_SENSITIVITY = 0.0025;

/**
 * Full free-look third-person orbit camera: yaw/pitch are driven by
 * `InputState.lookDeltaX/Y` (mouse pointer-lock movement on desktop,
 * touch-drag on mobile — see MouseLookController.tsx/TouchLookArea.tsx)
 * and are held in local refs, independent of the player's own heading.
 * `getCameraYaw` is exposed so player movement can be camera-relative
 * (see playerMovement.ts) — pushing "forward" always means "away from
 * wherever the camera is currently looking," the standard third-person
 * convention, rather than a fixed world axis.
 */
export function CameraController({
  getTransform,
  getInputState,
  onYawChange,
  reducedMotion = false,
}: {
  getTransform: () => PlayerTransform;
  getInputState: () => InputState;
  onYawChange?: (yaw: number) => void;
  reducedMotion?: boolean;
}) {
  const { camera } = useThree();
  const yawRef = useRef(0);
  const pitchRef = useRef(DEFAULT_PITCH);
  const initializedRef = useRef(false);

  useFrame((_, dt) => {
    const t = getTransform();
    const input = getInputState();

    if (!initializedRef.current) {
      // Start the camera behind the player's initial facing, then hand
      // control over to free look from here on.
      yawRef.current = t.heading;
      initializedRef.current = true;
    }

    yawRef.current -= input.lookDeltaX * LOOK_SENSITIVITY;
    pitchRef.current = THREE.MathUtils.clamp(
      pitchRef.current + input.lookDeltaY * LOOK_SENSITIVITY,
      MIN_PITCH,
      MAX_PITCH,
    );
    onYawChange?.(yawRef.current);

    const indoor = isIndoorZone(resolveOfficeZone(t.x, t.z));
    const distance = indoor ? INDOOR_DISTANCE : OUTDOOR_DISTANCE;

    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    const horizontal = distance * Math.cos(pitch);
    const vertical = distance * Math.sin(pitch);

    const target = new THREE.Vector3(t.x, LOOK_HEIGHT, t.z);
    const desiredPos = new THREE.Vector3(
      t.x - Math.sin(yaw) * horizontal,
      LOOK_HEIGHT + vertical,
      t.z - Math.cos(yaw) * horizontal,
    );

    if (reducedMotion) {
      camera.position.copy(desiredPos);
    } else {
      const damping = 1 - Math.exp(-DAMPING * dt);
      camera.position.lerp(desiredPos, damping);
    }

    camera.lookAt(target);
  });

  return null;
}
