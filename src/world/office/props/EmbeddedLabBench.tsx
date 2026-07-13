"use client";

import type { OfficeMaterials } from "../OfficeMaterials";

/**
 * Representative (generic, non-trademarked) embedded engineering bench
 * equipment: development board, debugger, oscilloscope-like unit,
 * bench power supply-like unit, and CAN/RS485/Ethernet connector
 * panels. These are visual placeholders and future interaction anchors
 * only — Milestone 3 does not implement the CAN/Modbus/BMS/EMS demos
 * (see docs/OFFICE_WORLD.md).
 */
export function EmbeddedLabBench({
  position,
  materials,
}: {
  position: [number, number, number];
  materials: OfficeMaterials;
}) {
  const [x, , z] = position;

  return (
    <group>
      {/* Bench */}
      <mesh position={[x, 0.75, z]} material={materials.deskSurface} receiveShadow castShadow>
        <boxGeometry args={[2.4, 0.06, 0.75]} />
      </mesh>
      <mesh position={[x, 0.36, z]} material={materials.deskFrame}>
        <boxGeometry args={[2.3, 0.72, 0.55]} />
      </mesh>

      {/* Oscilloscope-like unit */}
      <mesh position={[x - 0.8, 1.0, z - 0.15]} material={materials.monitor} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.35]} />
      </mesh>
      <mesh position={[x - 0.8, 1.0, z - 0.15 + 0.18]} material={materials.screenGlow}>
        <boxGeometry args={[0.4, 0.3, 0.01]} />
      </mesh>

      {/* Bench power supply-like unit */}
      <mesh position={[x - 0.15, 0.92, z - 0.15]} material={materials.equipment} castShadow>
        <boxGeometry args={[0.35, 0.22, 0.3]} />
      </mesh>

      {/* Development board + debugger */}
      <mesh position={[x + 0.35, 0.79, z]} material={materials.accent} castShadow>
        <boxGeometry args={[0.24, 0.03, 0.18]} />
      </mesh>
      <mesh position={[x + 0.6, 0.8, z]} material={materials.equipment}>
        <boxGeometry args={[0.12, 0.05, 0.08]} />
      </mesh>

      {/* CAN / RS485 / Ethernet connector panel */}
      <mesh position={[x + 0.95, 0.9, z - 0.2]} material={materials.equipment} castShadow>
        <boxGeometry args={[0.3, 0.25, 0.15]} />
      </mesh>
    </group>
  );
}
