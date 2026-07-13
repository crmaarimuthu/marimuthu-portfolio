"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useOfficeStore } from "@/state/useOfficeStore";
import { isDoorAnimating, type DoorState } from "../doorState";
import type { OfficeMaterials } from "../OfficeMaterials";

const DOOR_WIDTH = 1.7;
const DOOR_HEIGHT = 2.4;
const DOOR_OPEN_ANGLE = Math.PI / 2;
const SWING_SPEED = Math.PI * 1.6; // rad/s

export function Door({
  doorId,
  position,
  hingeAxisX = -1,
  facingRotationY = 0,
  materials,
}: {
  doorId: string;
  position: [number, number, number];
  /** -1 or 1: which edge of the door slab the hinge sits on. */
  hingeAxisX?: -1 | 1;
  facingRotationY?: number;
  materials: OfficeMaterials;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);

  const state = useOfficeStore((s) => s.doorStates[doorId] ?? "CLOSED");
  const dispatchDoorEvent = useOfficeStore((s) => s.dispatchDoorEvent);

  useFrame((_, dt) => {
    const targetAngle = state === "OPEN" || state === "OPENING" ? DOOR_OPEN_ANGLE : 0;
    const delta = targetAngle - angleRef.current;
    const step = Math.sign(delta) * Math.min(Math.abs(delta), SWING_SPEED * dt);
    angleRef.current += step;

    if (groupRef.current) {
      groupRef.current.rotation.y = facingRotationY + hingeAxisX * angleRef.current;
    }

    if (isDoorAnimating(state) && Math.abs(delta - step) < 0.01) {
      dispatchDoorEvent(doorId, state === "OPENING" ? "OPEN_ANIMATION_DONE" : "CLOSE_ANIMATION_DONE");
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        position={[hingeAxisX * (DOOR_WIDTH / 2), DOOR_HEIGHT / 2, 0]}
        material={doorMaterialFor(state, materials)}
        castShadow
      >
        <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, 0.06]} />
      </mesh>
    </group>
  );
}

function doorMaterialFor(state: DoorState, materials: OfficeMaterials) {
  return state === "LOCKED" ? materials.equipment : materials.door;
}
