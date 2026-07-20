"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Line, RoundedBox, Sparkles, Trail } from "@react-three/drei";
import * as THREE from "three";
import { Oscilloscope } from "./Oscilloscope";

const BLUE = "#4c8dff";
const ORANGE = "#ff7a29";

/** Slowly auto-rotating "rotating PCB" group — the whole scene turns, never the camera. */
function RotatingRig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });
  return (
    <group ref={group} rotation={[0.18, 0, 0]}>
      {children}
    </group>
  );
}

function PcbBoard() {
  const traces = useMemo(
    () => [
      { points: [[-1.5, 0.011, -1.0], [-0.3, 0.011, -1.0], [-0.3, 0.011, -0.2], [0.6, 0.011, -0.2]] as [number, number, number][], color: BLUE },
      { points: [[1.4, 0.011, 0.9], [1.4, 0.011, 0.1], [0.5, 0.011, 0.1], [0.5, 0.011, 0.7]] as [number, number, number][], color: ORANGE },
      { points: [[-1.4, 0.011, 1.1], [-0.6, 0.011, 1.1], [-0.6, 0.011, 0.3], [-1.4, 0.011, 0.3]] as [number, number, number][], color: BLUE },
      { points: [[0, 0.011, -1.3], [0, 0.011, -0.6], [-0.9, 0.011, -0.6]] as [number, number, number][], color: ORANGE },
    ],
    []
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.6, 3.2]} />
        <meshStandardMaterial color="#07130c" roughness={0.75} metalness={0.15} />
      </mesh>
      {traces.map((trace, i) => (
        <Line key={i} points={trace.points} color={trace.color} lineWidth={1.4} toneMapped={false} transparent opacity={0.75} />
      ))}
    </group>
  );
}

function Chip({
  position,
  size = [0.42, 0.14, 0.42] as [number, number, number],
  color,
}: {
  position: [number, number, number];
  size?: [number, number, number];
  color: string;
}) {
  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6} floatingRange={[0, 0.18]}>
      <RoundedBox position={position} args={size} radius={0.03} smoothness={4} castShadow>
        <meshStandardMaterial color="#10161f" emissive={color} emissiveIntensity={0.55} roughness={0.35} metalness={0.4} />
      </RoundedBox>
    </Float>
  );
}

/** A glowing packet flowing around the board's edge, representing CAN bus traffic. */
function CanPacket({ radius = 1.55, height = 0.05, speed = 0.09, color = ORANGE }: { radius?: number; height?: number; speed?: number; color?: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-radius, height, -radius * 0.75),
          new THREE.Vector3(radius, height, -radius * 0.75),
          new THREE.Vector3(radius, height, radius * 0.75),
          new THREE.Vector3(-radius, height, radius * 0.75),
        ],
        true
      ),
    [radius, height]
  );

  useFrame((_, delta) => {
    t.current = (t.current + delta * speed) % 1;
    const p = curve.getPointAt(t.current);
    mesh.current?.position.copy(p);
  });

  return (
    <Trail width={2.2} length={5} color={color} attenuation={(w) => w * w} decay={1.5}>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

export function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[-2.2, 1.6, 1.4]} color={BLUE} intensity={18} distance={8} />
      <pointLight position={[2.4, 1.2, -1.6]} color={ORANGE} intensity={16} distance={8} />
      <directionalLight position={[0, 3, 2]} intensity={0.4} />

      <RotatingRig>
        <PcbBoard />
        <Chip position={[-0.65, 0.14, -0.6]} size={[0.5, 0.16, 0.5]} color={BLUE} />
        <Chip position={[0.85, 0.13, 0.45]} size={[0.4, 0.14, 0.4]} color={ORANGE} />
        <Chip position={[-0.95, 0.12, 0.65]} size={[0.42, 0.13, 0.3]} color={BLUE} />
        <Oscilloscope position={[0.15, 0.55, -1.05]} />
        <CanPacket radius={1.5} speed={0.085} color={ORANGE} />
        <CanPacket radius={1.15} speed={-0.11} color={BLUE} />
      </RotatingRig>

      <Sparkles count={70} scale={[4.5, 2.2, 4.5]} size={2.2} speed={0.25} color={BLUE} opacity={0.55} />
      <Sparkles count={40} scale={[3.5, 1.6, 3.5]} size={1.6} speed={0.18} color={ORANGE} opacity={0.4} />
    </>
  );
}
