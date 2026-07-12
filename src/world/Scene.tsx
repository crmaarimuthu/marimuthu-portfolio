"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { detectCapability } from "@/engine/core/capability";
import { selectInitialQualityLevel } from "@/config/quality";
import { QUALITY_PROFILES } from "@/config/quality";
import { useAppStore } from "@/state/useAppStore";
import { useDeviceClass } from "@/engine/core/useDeviceClass";
import { LoadingScreen } from "@/ui/LoadingScreen";
import { PortfolioFallback } from "@/ui/PortfolioFallback";
import { Hud } from "@/ui/Hud";
import { Experience } from "./Experience";
import { InputManager } from "@/engine/input/InputManager";

type CapabilityStatus =
  | { status: "checking" }
  | { status: "unsupported"; reason: string | null }
  | { status: "supported" };

/**
 * Scene is only ever mounted client-side (dynamic import with ssr: false
 * in app/page.tsx), so computing capability/quality once via lazy
 * useState initializers is safe and avoids a setState-in-effect render
 * cascade.
 */
export function Scene() {
  const [capability] = useState<CapabilityStatus>(() => {
    const result = detectCapability();
    return result.supported
      ? { status: "supported" }
      : { status: "unsupported", reason: result.reason };
  });
  const deviceClass = useDeviceClass();
  const qualityLevel = useAppStore((s) => s.qualityLevel);
  const setQualityLevel = useAppStore((s) => s.setQualityLevel);
  const inputManager = useMemo(() => new InputManager(), []);

  useEffect(() => {
    if (capability.status !== "supported") return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const level = selectInitialQualityLevel({
      deviceMemoryGB: nav.deviceMemory ?? null,
      hardwareConcurrency: navigator.hardwareConcurrency ?? null,
      isMobileUserAgent: /Mobi|Android/i.test(navigator.userAgent),
      viewportWidth: window.innerWidth,
    });
    setQualityLevel(level, false);
  }, [capability.status, setQualityLevel]);

  if (capability.status === "unsupported") {
    return <PortfolioFallback reason={capability.reason} />;
  }

  const profile = QUALITY_PROFILES[qualityLevel];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b0d10" }}>
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows={profile.shadows}
          dpr={[1, profile.pixelRatioCap]}
          gl={{ antialias: profile.antialias }}
          camera={{ fov: 55, near: 0.1, far: profile.drawDistance }}
        >
          <Experience inputManager={inputManager} />
        </Canvas>
      </Suspense>
      <Hud inputManager={inputManager} deviceClass={deviceClass} />
    </div>
  );
}
