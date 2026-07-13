"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEmbeddedStore } from "@/state/useEmbeddedStore";
import type { OfficeMaterials } from "../OfficeMaterials";

const LED_ON_COLOR = new THREE.Color("#3dff6e");
const LED_OFF_COLOR = new THREE.Color("#1a3a22");

/**
 * The generic 3D embedded development board at the player's
 * workstation: PCB-like body, MCU package, header pins, power
 * indicator, and a user LED. Visually believable but deliberately
 * generic — not a reproduction of any specific commercial board.
 *
 * The LED subscribes directly to VirtualGPIO state (via
 * useEmbeddedStore) every frame — it is never an independent looping
 * animation. See docs/VIRTUAL_BOARD.md "3D LED state binding".
 */
export function EmbeddedBoard3D({
  position,
  materials,
}: {
  position: [number, number, number];
  materials: OfficeMaterials;
}) {
  const ledMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [x, y, z] = position;

  useFrame(() => {
    const state = useEmbeddedStore.getState();
    const pin = state.board.gpio[state.project.expectedBehaviour.pin];
    const isOn = pin?.level === "HIGH";

    const material = ledMaterialRef.current;
    if (!material) return;
    material.color.copy(isOn ? LED_ON_COLOR : LED_OFF_COLOR);
    material.emissive.copy(isOn ? LED_ON_COLOR : LED_OFF_COLOR);
    material.emissiveIntensity = isOn ? 1.6 : 0.05;
  });

  const powerOn = useEmbeddedStore((s) => s.board.powerState === "ON");

  return (
    <group position={[x, y, z]}>
      {/* PCB body */}
      <mesh material={materials.deskFrame} castShadow>
        <boxGeometry args={[0.22, 0.015, 0.16]} />
      </mesh>

      {/* Generic MCU package */}
      <mesh position={[-0.03, 0.018, 0]} material={materials.equipment}>
        <boxGeometry args={[0.06, 0.02, 0.06]} />
      </mesh>

      {/* Header pins (two rows, instanced-free since count is tiny) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`pin-top-${i}`}
          position={[-0.09 + i * 0.03, 0.02, -0.075]}
          material={materials.signage}
        >
          <boxGeometry args={[0.006, 0.02, 0.006]} />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`pin-bottom-${i}`}
          position={[-0.09 + i * 0.03, 0.02, 0.075]}
          material={materials.signage}
        >
          <boxGeometry args={[0.006, 0.02, 0.006]} />
        </mesh>
      ))}

      {/* Power indicator LED (fixed, tracks board power state) */}
      <mesh position={[0.09, 0.02, -0.06]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshStandardMaterial
          color={powerOn ? "#ff5c5c" : "#3a1a1a"}
          emissive={powerOn ? "#ff5c5c" : "#000000"}
          emissiveIntensity={powerOn ? 1.2 : 0}
        />
      </mesh>

      {/* User LED — bound to VirtualGPIO state every frame above */}
      <mesh position={[0.09, 0.02, 0.06]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial ref={ledMaterialRef} color={LED_OFF_COLOR} emissive={LED_OFF_COLOR} />
      </mesh>
    </group>
  );
}
