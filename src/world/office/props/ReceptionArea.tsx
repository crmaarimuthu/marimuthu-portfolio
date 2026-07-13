"use client";

import type { OfficeMaterials } from "../OfficeMaterials";

/**
 * Reception desk + waiting-area seating. No receptionist NPC yet — that
 * belongs to Milestone 5; `npcSpawnPoint` below is left as a documented
 * future anchor.
 */
export function ReceptionArea({ center, materials }: { center: [number, number, number]; materials: OfficeMaterials }) {
  const [x, , z] = center;

  return (
    <group>
      {/* Reception desk (curved-look via two angled boxes) */}
      <mesh position={[x, 0.55, z]} material={materials.deskFrame} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.1, 0.6]} />
      </mesh>
      <mesh position={[x, 1.14, z]} material={materials.deskSurface}>
        <boxGeometry args={[2.3, 0.06, 0.7]} />
      </mesh>

      {/* Waiting-area seating */}
      {[-1.4, -0.4, 0.6, 1.6].map((ox, i) => (
        <mesh key={i} position={[x + ox, 0.32, z + 2.4]} material={materials.chair}>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
        </mesh>
      ))}
    </group>
  );
}
