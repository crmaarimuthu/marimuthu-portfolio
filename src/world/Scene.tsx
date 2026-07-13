"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { detectCapability, type CapabilityResult } from "@/engine/core/capability";
import {
  QUALITY_PROFILES,
  readPersistedQualityOverride,
  selectInitialQualityLevel,
} from "@/config/quality";
import { useAppStore } from "@/state/useAppStore";
import { useDeviceClass } from "@/engine/core/useDeviceClass";
import { LoadingScreen } from "@/ui/LoadingScreen";
import { PortfolioFallback } from "@/ui/PortfolioFallback";
import { Hud } from "@/ui/Hud";
import { Experience } from "./Experience";
import { InputManager } from "@/engine/input/InputManager";

/**
 * Scene is only ever mounted client-side (dynamic import with ssr: false
 * in app/page.tsx), so computing capability once via a lazy useState
 * initializer is safe and avoids a setState-in-effect render cascade.
 */
export function Scene() {
  const [capability] = useState<CapabilityResult>(() => detectCapability());
  const [documentVisible, setDocumentVisible] = useState(true);
  const deviceClass = useDeviceClass();
  const qualityLevel = useAppStore((s) => s.qualityLevel);
  const setQualityLevel = useAppStore((s) => s.setQualityLevel);
  const inputManager = useMemo(() => new InputManager(), []);

  useEffect(() => {
    if (!capability.supported) return;

    const persisted = readPersistedQualityOverride();
    if (persisted) {
      setQualityLevel(persisted, true);
      return;
    }

    const level = selectInitialQualityLevel({
      deviceMemoryGB: capability.deviceMemoryGB,
      hardwareConcurrency: capability.hardwareConcurrency,
      isMobileUserAgent: capability.touch && capability.coarsePointer,
      viewportWidth: window.innerWidth,
    });
    setQualityLevel(level, false);
  }, [capability, setQualityLevel]);

  useEffect(() => {
    function handleVisibilityChange() {
      setDocumentVisible(document.visibilityState === "visible");
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!capability.supported) {
    return <PortfolioFallback reason={capability.reason} />;
  }

  const profile = QUALITY_PROFILES[qualityLevel];
  const dprCap = Math.min(profile.pixelRatioCap, capability.devicePixelRatio);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b0d10" }}>
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows={profile.shadows}
          dpr={[1, dprCap]}
          gl={{ antialias: profile.antialias }}
          camera={{ fov: 55, near: 0.1, far: profile.drawDistance }}
          frameloop={documentVisible ? "always" : "never"}
          resize={{ scroll: false }}
        >
          <Experience inputManager={inputManager} reducedMotion={capability.prefersReducedMotion} />
        </Canvas>
      </Suspense>
      <Hud inputManager={inputManager} deviceClass={deviceClass} />
    </div>
  );
}
