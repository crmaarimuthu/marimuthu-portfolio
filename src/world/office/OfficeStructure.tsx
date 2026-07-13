"use client";

import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import { buildOfficeWallSegments } from "./wallSegments";
import { BUILDING_SHELL, BUILDING_WALL_HEIGHT } from "./officeLayout";
import type { OfficeMaterials } from "./OfficeMaterials";

/**
 * Renders every non-door wall segment as a single instanced mesh
 * (one draw call for the whole office shell + all room walls) — see
 * docs/PERFORMANCE.md for the instancing rationale. Door openings are
 * rendered separately by <Door>.
 */
export function OfficeStructure({ materials }: { materials: OfficeMaterials }) {
  const wallInstances = useMemo(
    () =>
      buildOfficeWallSegments()
        .filter((segment) => !segment.doorId)
        .map((segment) => {
          const width = segment.bounds.maxX - segment.bounds.minX;
          const depth = segment.bounds.maxZ - segment.bounds.minZ;
          const centerX = (segment.bounds.minX + segment.bounds.maxX) / 2;
          const centerZ = (segment.bounds.minZ + segment.bounds.maxZ) / 2;
          return { id: segment.id, width, depth, centerX, centerZ };
        }),
    [],
  );

  const floorWidth = BUILDING_SHELL.maxX - BUILDING_SHELL.minX;
  const floorDepth = BUILDING_SHELL.maxZ - BUILDING_SHELL.minZ;
  const floorCenterX = (BUILDING_SHELL.minX + BUILDING_SHELL.maxX) / 2;
  const floorCenterZ = (BUILDING_SHELL.minZ + BUILDING_SHELL.maxZ) / 2;

  return (
    <>
      <mesh
        position={[floorCenterX, 0.01, floorCenterZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={materials.floor}
      >
        <planeGeometry args={[floorWidth, floorDepth]} />
      </mesh>

      <mesh position={[floorCenterX, BUILDING_WALL_HEIGHT + 0.05, floorCenterZ]} material={materials.roof}>
        <boxGeometry args={[floorWidth + 0.6, 0.1, floorDepth + 0.6]} />
      </mesh>

      <Instances limit={wallInstances.length} material={materials.wall} castShadow receiveShadow>
        <boxGeometry args={[1, BUILDING_WALL_HEIGHT, 1]} />
        {wallInstances.map((w) => (
          <Instance
            key={w.id}
            position={[w.centerX, BUILDING_WALL_HEIGHT / 2, w.centerZ]}
            scale={[Math.max(w.width, 0.05), 1, Math.max(w.depth, 0.05)]}
          />
        ))}
      </Instances>
    </>
  );
}
