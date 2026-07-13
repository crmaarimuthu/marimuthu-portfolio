export interface CapabilityResult {
  webgl: boolean;
  webgl2: boolean;
  webgpu: boolean;
  touch: boolean;
  coarsePointer: boolean;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  prefersReducedMotion: boolean;
  deviceMemoryGB: number | null;
  hardwareConcurrency: number | null;
  /** Minimum bar for the 3D experience: WebGL2 must be available. */
  supported: boolean;
  reason: string | null;
}

/**
 * Probes browser/device capability. Must only run client-side. User-agent
 * string is never used as the sole signal — every field here is a direct
 * feature/API probe.
 */
export function detectCapability(): CapabilityResult {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return emptyResult("no-window");
  }

  let webgl = false;
  let webgl2 = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = !!canvas.getContext("webgl");
    webgl2 = !!canvas.getContext("webgl2");
  } catch {
    // context creation can throw on some locked-down browsers; treat as unsupported
  }

  const webgpu = typeof navigator !== "undefined" && "gpu" in navigator;

  const touch =
    "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;

  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = navigator as Navigator & { deviceMemory?: number };

  return {
    webgl,
    webgl2,
    webgpu,
    touch,
    coarsePointer,
    devicePixelRatio: window.devicePixelRatio || 1,
    screenWidth: window.screen?.width ?? window.innerWidth,
    screenHeight: window.screen?.height ?? window.innerHeight,
    prefersReducedMotion,
    deviceMemoryGB: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    hardwareConcurrency:
      typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null,
    supported: webgl2,
    reason: webgl2 ? null : "no-webgl2-context",
  };
}

function emptyResult(reason: string): CapabilityResult {
  return {
    webgl: false,
    webgl2: false,
    webgpu: false,
    touch: false,
    coarsePointer: false,
    devicePixelRatio: 1,
    screenWidth: 0,
    screenHeight: 0,
    prefersReducedMotion: false,
    deviceMemoryGB: null,
    hardwareConcurrency: null,
    supported: false,
    reason,
  };
}
