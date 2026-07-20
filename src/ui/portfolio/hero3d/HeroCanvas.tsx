"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { HeroScene } from "./HeroScene";

/**
 * The hero's WebGL layer — mounted only when `detectCapability()` confirms
 * WebGL2 and the visitor hasn't asked for reduced motion (see
 * PortfolioPage.tsx `Hero3D`). Transparent canvas background so the CSS
 * ambient gradient/grid in portfolio.css shows through behind it.
 */
export function HeroCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 42, position: [0, 1.4, 5.4], near: 0.1, far: 20 }}
      frameloop="always"
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <HeroScene />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.7} luminanceThreshold={0.18} luminanceSmoothing={0.35} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
