import { beforeEach, describe, expect, it } from "vitest";
import { EMBEDDED_GPIO_ACHIEVEMENT, isAchievementUnlocked, unlockAchievement } from "./achievement";

describe("achievement persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("is not unlocked by default", () => {
    expect(isAchievementUnlocked(EMBEDDED_GPIO_ACHIEVEMENT.id)).toBe(false);
  });

  it("unlocks and persists across reads", () => {
    unlockAchievement(EMBEDDED_GPIO_ACHIEVEMENT.id);
    expect(isAchievementUnlocked(EMBEDDED_GPIO_ACHIEVEMENT.id)).toBe(true);
  });

  it("unlocking twice does not duplicate the stored entry", () => {
    unlockAchievement(EMBEDDED_GPIO_ACHIEVEMENT.id);
    unlockAchievement(EMBEDDED_GPIO_ACHIEVEMENT.id);
    const raw = window.localStorage.getItem("portfolio.achievements");
    expect(JSON.parse(raw ?? "[]")).toEqual([EMBEDDED_GPIO_ACHIEVEMENT.id]);
  });

  it("ignores corrupted storage gracefully", () => {
    window.localStorage.setItem("portfolio.achievements", "not json");
    expect(isAchievementUnlocked(EMBEDDED_GPIO_ACHIEVEMENT.id)).toBe(false);
  });
});
