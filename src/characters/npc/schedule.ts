export type ScheduleActivity = "ARRIVAL" | "WORK" | "MEETING" | "BREAK" | "LEAVING" | "OFF_DUTY";

export interface ScheduleBlock {
  /** Minutes after midnight (0-1439). */
  startMinute: number;
  activity: ScheduleActivity;
}

export interface ScheduleTemplate {
  id: string;
  blocks: ScheduleBlock[];
}

/**
 * Role-aware schedule templates (see docs/NPC_SCHEDULES.md). Every
 * template follows the brief's example shape (ARRIVAL -> WORK ->
 * MEETING -> WORK -> BREAK -> WORK -> LEAVING -> OFF_DUTY) with role-
 * appropriate meeting placement — this is simulated world time for
 * portfolio atmosphere, not real employee monitoring.
 */
export const SCHEDULE_TEMPLATES: Record<string, ScheduleTemplate> = {
  leadership: {
    id: "leadership",
    blocks: [
      { startMinute: 540, activity: "ARRIVAL" }, // 09:00
      { startMinute: 555, activity: "WORK" }, // 09:15
      { startMinute: 630, activity: "MEETING" }, // 10:30 leadership discussion
      { startMinute: 690, activity: "WORK" }, // 11:30
      { startMinute: 780, activity: "BREAK" }, // 13:00
      { startMinute: 840, activity: "WORK" }, // 14:00
      { startMinute: 1080, activity: "LEAVING" }, // 18:00
      { startMinute: 1110, activity: "OFF_DUTY" },
    ],
  },
  hr: {
    id: "hr",
    blocks: [
      { startMinute: 540, activity: "ARRIVAL" },
      { startMinute: 555, activity: "WORK" },
      { startMinute: 660, activity: "MEETING" }, // 11:00 people-ops sync
      { startMinute: 690, activity: "WORK" },
      { startMinute: 780, activity: "BREAK" },
      { startMinute: 840, activity: "WORK" },
      { startMinute: 1050, activity: "LEAVING" }, // 17:30
      { startMinute: 1080, activity: "OFF_DUTY" },
    ],
  },
  manager: {
    id: "manager",
    blocks: [
      { startMinute: 540, activity: "ARRIVAL" },
      { startMinute: 555, activity: "WORK" },
      { startMinute: 660, activity: "MEETING" }, // team review
      { startMinute: 690, activity: "WORK" },
      { startMinute: 780, activity: "BREAK" },
      { startMinute: 840, activity: "WORK" },
      { startMinute: 1080, activity: "LEAVING" },
      { startMinute: 1110, activity: "OFF_DUTY" },
    ],
  },
  "team-lead": {
    id: "team-lead",
    blocks: [
      { startMinute: 540, activity: "ARRIVAL" },
      { startMinute: 555, activity: "WORK" },
      { startMinute: 660, activity: "MEETING" }, // team discussion
      { startMinute: 690, activity: "WORK" },
      { startMinute: 780, activity: "BREAK" },
      { startMinute: 840, activity: "WORK" },
      { startMinute: 1080, activity: "LEAVING" },
      { startMinute: 1110, activity: "OFF_DUTY" },
    ],
  },
  engineer: {
    id: "engineer",
    blocks: [
      { startMinute: 540, activity: "ARRIVAL" },
      { startMinute: 555, activity: "WORK" },
      { startMinute: 660, activity: "MEETING" },
      { startMinute: 690, activity: "WORK" },
      { startMinute: 780, activity: "BREAK" },
      { startMinute: 840, activity: "WORK" },
      { startMinute: 1080, activity: "LEAVING" },
      { startMinute: 1110, activity: "OFF_DUTY" },
    ],
  },
  validation: {
    id: "validation",
    blocks: [
      { startMinute: 540, activity: "ARRIVAL" },
      { startMinute: 555, activity: "WORK" },
      { startMinute: 660, activity: "MEETING" },
      { startMinute: 690, activity: "WORK" },
      { startMinute: 780, activity: "BREAK" },
      { startMinute: 840, activity: "WORK" },
      { startMinute: 1080, activity: "LEAVING" },
      { startMinute: 1110, activity: "OFF_DUTY" },
    ],
  },
  "office-worker": {
    id: "office-worker",
    blocks: [
      { startMinute: 540, activity: "ARRIVAL" },
      { startMinute: 555, activity: "WORK" },
      { startMinute: 780, activity: "BREAK" },
      { startMinute: 840, activity: "WORK" },
      { startMinute: 1080, activity: "LEAVING" },
      { startMinute: 1110, activity: "OFF_DUTY" },
    ],
  },
};

/** Small deterministic string hash (djb2) — no external dependency, stable across runs. */
function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Deterministic per-NPC per-block timing offset within
 * [-rangeMinutes, +rangeMinutes], seeded from the NPC id and block
 * index — so NPCs sharing a schedule template don't all change
 * activity in the exact same second, while remaining fully
 * reproducible/testable (same npcId + block always yields the same
 * offset).
 */
export function seededScheduleOffset(npcId: string, blockIndex: number, rangeMinutes = 6): number {
  const hash = djb2Hash(`${npcId}:${blockIndex}`);
  return (hash % (rangeMinutes * 2 + 1)) - rangeMinutes;
}

/**
 * Resolves which activity a given NPC should be performing at a given
 * world-time minute-of-day, applying that NPC's seeded per-block
 * offset. Falls back to OFF_DUTY before the first block and wraps
 * around after the last.
 */
export function resolveScheduleActivity(
  template: ScheduleTemplate,
  npcId: string,
  worldTimeMinutes: number,
): ScheduleActivity {
  const minuteOfDay = ((worldTimeMinutes % 1440) + 1440) % 1440;

  let active: ScheduleActivity = "OFF_DUTY";
  for (let i = 0; i < template.blocks.length; i++) {
    const block = template.blocks[i];
    const effectiveStart = block.startMinute + seededScheduleOffset(npcId, i);
    if (minuteOfDay >= effectiveStart) {
      active = block.activity;
    }
  }
  return active;
}
