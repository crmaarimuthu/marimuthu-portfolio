"use client";

import { workplaceConfig } from "@/config/workplace";
import { BUILDING_SHELL } from "./officeLayout";
import { RoomLabel } from "./props/RoomLabel";
import type { OfficeMaterials } from "./OfficeMaterials";

/**
 * Exterior blockout: entrance path connecting to the Milestone 1 test
 * environment, signage from workplaceConfig (never a hardcoded/invented
 * name — see docs/PRIVACY_REVIEW.md), and simple exterior light props.
 */
export function OfficeExterior({ materials }: { materials: OfficeMaterials }) {
  const centerX = (BUILDING_SHELL.minX + BUILDING_SHELL.maxX) / 2;
  const entranceZ = BUILDING_SHELL.maxZ;

  return (
    <group>
      {/* Entrance path from the outdoor spawn area to the door. */}
      <mesh position={[centerX, 0.02, entranceZ + 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 8]} />
        <meshStandardMaterial color="#6b6f74" roughness={0.95} />
      </mesh>

      {/* Building signage */}
      <mesh position={[centerX, 3.6, entranceZ + 0.15]} material={materials.signage} castShadow>
        <boxGeometry args={[5.5, 0.8, 0.08]} />
      </mesh>
      <RoomLabel
        text={workplaceConfig.buildingDisplayName}
        position={[centerX, 3.6, entranceZ + 0.2]}
        rotationY={0}
      />

      {/* Exterior light fixtures flanking the entrance. */}
      {[-3.5, 3.5].map((ox, i) => (
        <group key={i} position={[centerX + ox, 0, entranceZ + 1.5]}>
          <mesh position={[0, 1.4, 0]} material={materials.equipment}>
            <cylinderGeometry args={[0.06, 0.06, 2.8, 8]} />
          </mesh>
          <mesh position={[0, 2.85, 0]} material={materials.screenGlow}>
            <sphereGeometry args={[0.16, 12, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
