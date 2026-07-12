"use client";

/**
 * Minimal Milestone 1 test environment: ground plane, a few reference
 * props, and basic lighting. Replaced by the real office/city in later
 * milestones.
 */
export function TestEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 4]} intensity={1.2} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a4048" />
      </mesh>

      {[
        [4, 0.5, 4],
        [-5, 0.5, 2],
        [2, 0.5, -6],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8a94a3" />
        </mesh>
      ))}
    </>
  );
}
