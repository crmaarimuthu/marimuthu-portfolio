"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerTransform } from "./playerMovement";
import { isIndoorZone, resolveOfficeZone } from "@/world/office/officeLayout";

const OUTDOOR_OFFSET = new THREE.Vector3(0, 2.6, -4.2);
/**
 * Indoor offset is shorter/lower — reduces the chance of the camera
 * poking through a wall in the tighter enclosed rooms while keeping the
 * player visible. This is a practical approximation, not true camera
 * collision (see docs/OFFICE_WORLD.md "Known limitations" — a proper
 * camera-vs-wall raycast is future work; keeping this logic in
 * CameraController rather than PlayerCapsule is what makes that future
 * upgrade a local change).
 */
const INDOOR_OFFSET = new THREE.Vector3(0, 2.1, -2.6);
const LOOK_HEIGHT = 1.3;
const DAMPING = 6;

/**
 * Third-person spring-arm style follow camera, decoupled from
 * PlayerCapsule's rendering. Free-orbit mouse look and true camera
 * collision are left for later milestones per the roadmap.
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
    const indoor = isIndoorZone(resolveOfficeZone(t.x, t.z));
    const offset = indoor ? INDOOR_OFFSET : OUTDOOR_OFFSET;

    const rotatedOffset = offset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), t.heading);
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
