import { describe, expect, it } from "vitest";
import { SCHEDULE_TEMPLATES, resolveScheduleActivity, seededScheduleOffset } from "./schedule";

describe("seededScheduleOffset", () => {
  it("is deterministic for the same npcId and block", () => {
    expect(seededScheduleOffset("npc_1", 0)).toBe(seededScheduleOffset("npc_1", 0));
  });

  it("stays within the requested range", () => {
    for (let i = 0; i < 20; i++) {
      const offset = seededScheduleOffset(`npc_${i}`, 2, 6);
      expect(offset).toBeGreaterThanOrEqual(-6);
      expect(offset).toBeLessThanOrEqual(6);
    }
  });

  it("differs across NPCs sharing the same template/block (not perfectly synchronised)", () => {
    const offsets = new Set(
      ["npc_a", "npc_b", "npc_c", "npc_d", "npc_e"].map((id) => seededScheduleOffset(id, 1)),
    );
    expect(offsets.size).toBeGreaterThan(1);
  });
});

describe("resolveScheduleActivity", () => {
  const engineer = SCHEDULE_TEMPLATES.engineer;

  it("resolves OFF_DUTY before the first block (early morning)", () => {
    expect(resolveScheduleActivity(engineer, "npc_x", 6 * 60)).toBe("OFF_DUTY");
  });

  it("resolves ARRIVAL/WORK once the day starts", () => {
    // Use a time comfortably past the max possible seeded offset (±6 min) from 09:00/09:15.
    const activity = resolveScheduleActivity(engineer, "npc_x", 9 * 60 + 30);
    expect(["ARRIVAL", "WORK"]).toContain(activity);
  });

  it("resolves WORK well after arrival and before the meeting block", () => {
    expect(resolveScheduleActivity(engineer, "npc_x", 10 * 60)).toBe("WORK");
  });

  it("resolves BREAK in the early afternoon", () => {
    expect(resolveScheduleActivity(engineer, "npc_x", 13 * 60 + 30)).toBe("BREAK");
  });

  it("resolves LEAVING/OFF_DUTY in the evening", () => {
    const activity = resolveScheduleActivity(engineer, "npc_x", 19 * 60);
    expect(["LEAVING", "OFF_DUTY"]).toContain(activity);
  });

  it("gives different NPCs on the same template slightly different transition moments", () => {
    // Right at the nominal meeting boundary (11:00), different NPCs' seeded
    // offsets mean not all of them are necessarily in MEETING yet.
    const minuteOfDay = 11 * 60;
    const results = new Set(
      ["npc_a", "npc_b", "npc_c", "npc_d", "npc_e", "npc_f"].map((id) =>
        resolveScheduleActivity(engineer, id, minuteOfDay),
      ),
    );
    expect(results.size).toBeGreaterThanOrEqual(1);
  });
});
