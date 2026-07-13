export interface Achievement {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

/**
 * This achievement records completion of an interactive portfolio
 * simulation — it is not, and must never be presented as, an
 * employment certification or formal qualification.
 */
export const EMBEDDED_GPIO_ACHIEVEMENT: Achievement = {
  id: "embedded_gpio_firmware",
  title: "Embedded Firmware Workflow",
  description:
    "Completed a virtual C firmware build, flash, GPIO control, and LED verification workflow (interactive portfolio simulation).",
  skills: ["C", "Embedded Firmware", "GPIO", "Build Workflow", "Firmware Flashing", "Debugging"],
};

const STORAGE_KEY = "portfolio.achievements";

function readUnlockedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function isAchievementUnlocked(id: string): boolean {
  return readUnlockedIds().includes(id);
}

/**
 * Persists the achievement locally. Intentionally NOT cleared by
 * "Reset Demo" (src/simulations/embedded/embeddedTaskState.ts RESET) —
 * an achievement is a permanent portfolio record of having completed
 * the task at least once, independent of the current demo session.
 */
export function unlockAchievement(id: string): void {
  if (typeof window === "undefined") return;
  const current = readUnlockedIds();
  if (current.includes(id)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]));
  } catch {
    // storage may be unavailable (private browsing quota); non-fatal
  }
}
