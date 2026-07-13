"use client";

import type { OfficeMaterials } from "../OfficeMaterials";

/** Executive desk + two visitor chairs — CEO/manager-style room. */
export function ExecutiveDeskSet({ center, materials }: { center: [number, number, number]; materials: OfficeMaterials }) {
  const [x, , z] = center;
  return (
    <group>
      <mesh position={[x, 0.75, z]} material={materials.deskSurface} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.06, 0.9]} />
      </mesh>
      <mesh position={[x, 0.36, z]} material={materials.deskFrame}>
        <boxGeometry args={[1.7, 0.72, 0.7]} />
      </mesh>
      <mesh position={[x, 0.5, z - 0.7]} material={materials.chair} castShadow>
        <boxGeometry args={[0.55, 1.0, 0.55]} />
      </mesh>
      <mesh position={[x - 0.5, 0.42, z + 0.85]} material={materials.chair}>
        <boxGeometry args={[0.45, 0.8, 0.45]} />
      </mesh>
      <mesh position={[x + 0.5, 0.42, z + 0.85]} material={materials.chair}>
        <boxGeometry args={[0.45, 0.8, 0.45]} />
      </mesh>
    </group>
  );
}

/** Meeting table with four surrounding chairs and a wall display. */
export function MeetingRoomFurniture({ center, materials }: { center: [number, number, number]; materials: OfficeMaterials }) {
  const [x, , z] = center;
  const chairOffsets: Array<[number, number]> = [
    [-1.1, 0],
    [1.1, 0],
    [0, -0.9],
    [0, 0.9],
  ];
  return (
    <group>
      <mesh position={[x, 0.72, z]} material={materials.deskSurface} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.06, 1.4]} />
      </mesh>
      <mesh position={[x, 0.34, z]} material={materials.deskFrame}>
        <boxGeometry args={[0.15, 0.68, 0.15]} />
      </mesh>
      {chairOffsets.map(([ox, oz], i) => (
        <mesh key={i} position={[x + ox, 0.45, z + oz]} material={materials.chair} castShadow>
          <boxGeometry args={[0.45, 0.85, 0.45]} />
        </mesh>
      ))}
      <mesh position={[x, 1.7, z - 1.3]} material={materials.monitor}>
        <boxGeometry args={[1.6, 0.9, 0.05]} />
      </mesh>
      <mesh position={[x, 1.7, z - 1.27]} material={materials.screenGlow}>
        <boxGeometry args={[1.5, 0.8, 0.01]} />
      </mesh>
    </group>
  );
}

/** HR-style desk with a small visitor seating pair. */
export function HrDeskSet({ center, materials }: { center: [number, number, number]; materials: OfficeMaterials }) {
  const [x, , z] = center;
  return (
    <group>
      <mesh position={[x, 0.75, z]} material={materials.deskSurface} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.06, 0.7]} />
      </mesh>
      <mesh position={[x, 0.36, z]} material={materials.deskFrame}>
        <boxGeometry args={[1.3, 0.72, 0.5]} />
      </mesh>
      <mesh position={[x, 0.45, z - 0.6]} material={materials.chair} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.5]} />
      </mesh>
      <mesh position={[x, 0.4, z + 0.75]} material={materials.chair}>
        <boxGeometry args={[0.8, 0.75, 0.45]} />
      </mesh>
    </group>
  );
}

/** Small pantry counter, table, and stools. */
export function PantryFurniture({ center, materials }: { center: [number, number, number]; materials: OfficeMaterials }) {
  const [x, , z] = center;
  return (
    <group>
      <mesh position={[x - 1.4, 0.5, z]} material={materials.deskFrame} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.0, 0.55]} />
      </mesh>
      <mesh position={[x - 1.4, 1.02, z]} material={materials.deskSurface}>
        <boxGeometry args={[1.25, 0.05, 0.6]} />
      </mesh>
      <mesh position={[x + 0.6, 0.5, z]} material={materials.deskSurface} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.05, 1.0]} />
      </mesh>
      <mesh position={[x + 0.6, 0.22, z]} material={materials.deskFrame}>
        <boxGeometry args={[0.1, 0.44, 0.1]} />
      </mesh>
      {[[0.6 - 0.6, z - 0.6], [0.6 + 0.6, z - 0.6]].map(([ox, oz], i) => (
        <mesh key={i} position={[x + ox, 0.35, oz]} material={materials.chair}>
          <boxGeometry args={[0.35, 0.7, 0.35]} />
        </mesh>
      ))}
    </group>
  );
}
