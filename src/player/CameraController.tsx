"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerTransform } from "./playerMovement";

const OFFSET = new THREE.Vector3(0, 2.6, -4.2);
const LOOK_HEIGHT = 1.3;
const DAMPING = 6;

/**
 * Third-person spring-arm style follow camera. Milestone 1 keeps the
 * offset fixed behind the character's heading; free-orbit mouse look,
 * camera collision, and vehicle/indoor camera modes are left for later
 * milestones per the roadmap (camera logic is intentionally decoupled
 * from PlayerCapsule's rendering so those modes can be added without
 * touching the player renderer).
 */
export function CameraController({
  getTransform,
  reducedMotion = false,
}: {
  getTransform: () => PlayerTransform;
  reducedMotion?: boolean;
}) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    const t = getTransform();
    const rotatedOffset = OFFSET.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), t.heading);
    const desiredPos = new THREE.Vector3(t.x + rotatedOffset.x, rotatedOffset.y, t.z + rotatedOffset.z);

    if (reducedMotion) {
      camera.position.copy(desiredPos);
    } else {
      const damping = 1 - Math.exp(-DAMPING * dt);
      camera.position.lerp(desiredPos, damping);
    }

    const lookAt = new THREE.Vector3(t.x, LOOK_HEIGHT, t.z);
    camera.lookAt(lookAt);
  });

  return null;
}
