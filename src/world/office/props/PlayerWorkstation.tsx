"use client";

import { PLAYER_WORKSTATION } from "../officeLayout";
import type { OfficeMaterials } from "../OfficeMaterials";
import { EmbeddedBoard3D } from "./EmbeddedBoard3D";

/**
 * The player's own configurable engineering workstation
 * (config.workplace.playerWorkstationId). Deliberately a bespoke,
 * non-instanced component (unlike the generic desk clusters) so its
 * interaction anchors (chair sit/stand, camera target, embedded board)
 * are easy to locate and reason about — see docs/OFFICE_WORLD.md
 * "Workstation anchors". The embedded board at `boardAnchor` runs the
 * Milestone 4 firmware build/flash/LED simulation — see
 * docs/VIRTUAL_BOARD.md.
 */
export function PlayerWorkstation({ materials }: { materials: OfficeMaterials }) {
  const [dx, , dz] = PLAYER_WORKSTATION.deskPosition;

  return (
    <group>
      {/* Desk */}
      <mesh position={[dx, 0.75, dz]} material={materials.deskSurface} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.05, 0.8]} />
      </mesh>
      <mesh position={[dx, 0.36, dz]} material={materials.deskFrame}>
        <boxGeometry args={[1.4, 0.72, 0.6]} />
      </mesh>

      {/* Chair (visual only — sit anchor comes from officeLayout, not this mesh) */}
      <mesh position={[dx, 0.45, dz + 0.62]} material={materials.chair} castShadow>
        <boxGeometry args={[0.52, 0.9, 0.52]} />
      </mesh>

      {/* Main monitor */}
      <mesh position={[dx - 0.15, 1.07, dz - 0.32]} material={materials.monitor} castShadow>
        <boxGeometry args={[0.55, 0.34, 0.03]} />
      </mesh>
      <mesh position={[dx - 0.15, 1.07, dz - 0.305]} material={materials.screenGlow}>
        <boxGeometry args={[0.49, 0.28, 0.01]} />
      </mesh>

      {/* Secondary monitor */}
      <mesh position={[dx + 0.42, 1.02, dz - 0.3]} rotation={[0, -0.35, 0]} material={materials.monitor} castShadow>
        <boxGeometry args={[0.4, 0.26, 0.03]} />
      </mesh>
      <mesh position={[dx + 0.42, 1.02, dz - 0.284]} rotation={[0, -0.35, 0]} material={materials.screenGlow}>
        <boxGeometry args={[0.35, 0.21, 0.01]} />
      </mesh>

      {/* Keyboard + mouse */}
      <mesh position={[dx - 0.15, 0.785, dz - 0.05]} material={materials.equipment}>
        <boxGeometry args={[0.38, 0.02, 0.14]} />
      </mesh>
      <mesh position={[dx + 0.12, 0.785, dz - 0.02]} material={materials.equipment}>
        <boxGeometry args={[0.06, 0.02, 0.1]} />
      </mesh>

      {/* Embedded development board (interaction anchor point) */}
      <EmbeddedBoard3D position={PLAYER_WORKSTATION.boardAnchor} materials={materials} />

      {/* Debug/programming device */}
      <mesh position={[dx + 0.35, 0.79, dz - 0.18]} material={materials.equipment}>
        <boxGeometry args={[0.1, 0.05, 0.07]} />
      </mesh>
    </group>
  );
}
