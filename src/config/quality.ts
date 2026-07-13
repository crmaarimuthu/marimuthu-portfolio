export type QualityLevel = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";

export type TextureQualityHint = "LOW" | "MEDIUM" | "HIGH";

export interface QualityProfile {
  level: QualityLevel;
  pixelRatioCap: number;
  shadows: boolean;
  shadowMapSize: number;
  drawDistance: number;
  antialias: boolean;
  environmentDetail: "LOW" | "MEDIUM" | "HIGH";
  /** Placeholder budgets consumed by later milestones (NPC/traffic systems). */
  npcBudget: number;
  trafficBudget: number;
  textureQualityHint: TextureQualityHint;
  postProcessingAllowed: boolean;
}

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  LOW: {
    level: "LOW",
    pixelRatioCap: 1,
    shadows: false,
    shadowMapSize: 512,
    drawDistance: 60,
    antialias: false,
    environmentDetail: "LOW",
    npcBudget: 0,
    trafficBudget: 0,
    textureQualityHint: "LOW",
    postProcessingAllowed: false,
  },
  MEDIUM: {
    level: "MEDIUM",
    pixelRatioCap: 1.5,
    shadows: false,
    shadowMapSize: 1024,
    drawDistance: 120,
    antialias: false,
    environmentDetail: "MEDIUM",
    npcBudget: 10,
    trafficBudget: 5,
    textureQualityHint: "MEDIUM",
    postProcessingAllowed: false,
  },
  HIGH: {
    level: "HIGH",
    pixelRatioCap: 2,
    shadows: true,
    shadowMapSize: 2048,
    drawDistance: 220,
    antialias: true,
    environmentDetail: "HIGH",
    npcBudget: 30,
    trafficBudget: 15,
    textureQualityHint: "HIGH",
    postProcessingAllowed: true,
  },
  ULTRA: {
    level: "ULTRA",
    pixelRatioCap: 2,
    shadows: true,
    shadowMapSize: 4096,
    drawDistance: 400,
    antialias: true,
    environmentDetail: "HIGH",
    npcBudget: 60,
    trafficBudget: 30,
    textureQualityHint: "HIGH",
    postProcessingAllowed: true,
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
 * Screen resolution alone never selects ULTRA — memory/core signals gate it.
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

const STORAGE_KEY = "portfolio.qualityOverride";

/**
 * Reads a manually-overridden quality level from localStorage. Returns
 * null if none was ever set or storage is unavailable (SSR, privacy mode).
 */
export function readPersistedQualityOverride(): QualityLevel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "LOW" || raw === "MEDIUM" || raw === "HIGH" || raw === "ULTRA") {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function persistQualityOverride(level: QualityLevel): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, level);
  } catch {
    // storage may be unavailable (private browsing quota); non-fatal
  }
}

export function clearPersistedQualityOverride(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // non-fatal
  }
}
