"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";

const SAMPLES = 64;
const WIDTH = 1.6;
const HEIGHT = 0.42;

/**
 * A small animated "oscilloscope" readout: a dark screen plane with a
 * moving waveform line. The waveform is recomputed every frame and
 * pushed into the Line2 geometry directly (`setPositions`) rather than
 * re-mounting <Line> each frame — the one piece of hand-rolled
 * per-frame geometry mutation in this scene; everything else in the
 * hero leans on drei's tested helpers (Float/Sparkles/Trail).
 */
export function Oscilloscope({ position }: { position: [number, number, number] }) {
  const lineRef = useRef<Line2>(null);
  const elapsed = useRef(0);

  const initialPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const x = (i / (SAMPLES - 1)) * WIDTH - WIDTH / 2;
      pts.push([x, 0, 0]);
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const geometry = lineRef.current?.geometry;
    if (!geometry) return;
    const positions: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const t = i / (SAMPLES - 1);
      const x = t * WIDTH - WIDTH / 2;
      const phase = t * 18 - elapsed.current * 3.2;
      const wave =
        Math.sin(phase) * 0.14 +
        Math.sin(phase * 2.3 + elapsed.current) * 0.05 +
        Math.sin(phase * 0.5) * 0.06;
      positions.push(x, wave, 0);
    }
    geometry.setPositions(positions);
  });

  return (
    <group position={position}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[WIDTH + 0.24, HEIGHT + 0.24]} />
        <meshStandardMaterial color="#050a06" emissive="#0a2a1a" emissiveIntensity={0.4} roughness={0.6} />
      </mesh>
      <Line ref={lineRef} points={initialPoints} color="#4dffb0" lineWidth={1.6} toneMapped={false} />
    </group>
  );
}
