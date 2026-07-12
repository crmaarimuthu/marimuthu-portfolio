"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerTransform } from "./playerMovement";

const OFFSET = new THREE.Vector3(0, 2.6, -4.2);
const LOOK_HEIGHT = 1.3;
const DAMPING = 6;

/**
 * Third-person spring-arm style follow camera. Milestone 1 keeps the
 * offset fixed behind the character's heading; free-orbit mouse look is
 * left for a later milestone per the roadmap.
 */
export function CameraController({
  getTransform,
}: {
  getTransform: () => PlayerTransform;
}) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    const t = getTransform();
    const rotatedOffset = OFFSET.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), t.heading);
    const desiredPos = new THREE.Vector3(t.x + rotatedOffset.x, rotatedOffset.y, t.z + rotatedOffset.z);
    const damping = 1 - Math.exp(-DAMPING * dt);
    camera.position.lerp(desiredPos, damping);

    const lookAt = new THREE.Vector3(t.x, LOOK_HEIGHT, t.z);
    camera.lookAt(lookAt);
  });

  return null;
}
