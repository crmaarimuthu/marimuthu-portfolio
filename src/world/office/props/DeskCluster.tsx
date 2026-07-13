"use client";

import { Instances, Instance } from "@react-three/drei";
import type { OfficeMaterials } from "../OfficeMaterials";

export interface DeskSpot {
  id: string;
  position: [number, number, number];
  rotationY?: number;
}

/**
 * Instanced desk cluster: desktop surfaces, monitor bodies, and screen
 * glow panels each render as one draw call regardless of desk count —
 * see docs/PERFORMANCE.md. Used for open-plan engineering/embedded-lab
 * desk rows (not the player's own detailed workstation, which is a
 * bespoke component so its interaction anchors are easy to reason
 * about).
 */
export function DeskCluster({ desks, materials }: { desks: DeskSpot[]; materials: OfficeMaterials }) {
  return (
    <>
      <Instances limit={desks.length} material={materials.deskSurface} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.05, 0.7]} />
        {desks.map((d) => (
          <Instance key={d.id} position={[d.position[0], 0.75, d.position[2]]} rotation={[0, d.rotationY ?? 0, 0]} />
        ))}
      </Instances>
      <Instances limit={desks.length} material={materials.deskFrame}>
        <boxGeometry args={[1.2, 0.72, 0.5]} />
        {desks.map((d) => (
          <Instance key={`${d.id}-leg`} position={[d.position[0], 0.36, d.position[2]]} rotation={[0, d.rotationY ?? 0, 0]} />
        ))}
      </Instances>
      <Instances limit={desks.length} material={materials.monitor} castShadow>
        <boxGeometry args={[0.5, 0.32, 0.03]} />
        {desks.map((d) => (
          <Instance
            key={`${d.id}-mon`}
            position={[d.position[0], 1.05, d.position[2] - 0.28]}
            rotation={[0, d.rotationY ?? 0, 0]}
          />
        ))}
      </Instances>
      <Instances limit={desks.length} material={materials.screenGlow}>
        <boxGeometry args={[0.44, 0.26, 0.01]} />
        {desks.map((d) => (
          <Instance
            key={`${d.id}-screen`}
            position={[d.position[0], 1.05, d.position[2] - 0.27]}
            rotation={[0, d.rotationY ?? 0, 0]}
          />
        ))}
      </Instances>
      <Instances limit={desks.length} material={materials.chair}>
        <boxGeometry args={[0.5, 0.9, 0.5]} />
        {desks.map((d) => (
          <Instance key={`${d.id}-chair`} position={[d.position[0], 0.45, d.position[2] + 0.55]} rotation={[0, d.rotationY ?? 0, 0]} />
        ))}
      </Instances>
    </>
  );
}
