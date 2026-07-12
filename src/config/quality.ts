export type QualityLevel = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";

export interface QualityProfile {
  level: QualityLevel;
  pixelRatioCap: number;
  shadows: boolean;
  shadowMapSize: number;
  drawDistance: number;
  antialias: boolean;
}

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  LOW: {
    level: "LOW",
    pixelRatioCap: 1,
    shadows: false,
    shadowMapSize: 512,
    drawDistance: 60,
    antialias: false,
  },
  MEDIUM: {
    level: "MEDIUM",
    pixelRatioCap: 1.5,
    shadows: false,
    shadowMapSize: 1024,
    drawDistance: 120,
    antialias: false,
  },
  HIGH: {
    level: "HIGH",
    pixelRatioCap: 2,
    shadows: true,
    shadowMapSize: 2048,
    drawDistance: 220,
    antialias: true,
  },
  ULTRA: {
    level: "ULTRA",
    pixelRatioCap: 2,
    shadows: true,
    shadowMapSize: 4096,
    drawDistance: 400,
    antialias: true,
  },
};

export interface DeviceHeuristics {
  deviceMemoryGB: number | null;
  hardwareConcurrency: number | null;
  isMobileUserAgent: boolean;
  viewportWidth: number;
}

/**
 * Pure function so it is unit-testable without a real browser/GPU.
 */
export function selectInitialQualityLevel(h: DeviceHeuristics): QualityLevel {
  if (h.isMobileUserAgent) {
    if ((h.deviceMemoryGB ?? 4) <= 2 || h.viewportWidth < 480) return "LOW";
    return "MEDIUM";
  }

  const memory = h.deviceMemoryGB ?? 8;
  const cores = h.hardwareConcurrency ?? 4;

  if (memory <= 2 || cores <= 2) return "LOW";
  if (memory <= 4 || cores <= 4) return "MEDIUM";
  if (memory <= 8 || cores <= 8) return "HIGH";
  return "ULTRA";
}
