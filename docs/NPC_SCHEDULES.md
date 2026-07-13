# NPC Schedules

This is **simulated world time for portfolio atmosphere** — not real
employee monitoring, not a model of anyone's actual working hours.

## World clock

`useNpcStore` maintains `worldTimeMinutes`, starting at `540` (09:00)
and advancing at `WORLD_MINUTES_PER_SECOND = 2` real-time — a full
09:00–18:00 simulated day (540 minutes) takes about 4.5 real minutes,
a reasonable pace for a portfolio visit. This clock is independent of
(and simpler than) the day/night lighting system planned for Milestone
8 — it exists purely to drive NPC schedule blocks for now.

## Schedule templates

`src/characters/npc/schedule.ts` — `SCHEDULE_TEMPLATES` keyed by
`scheduleTemplateId` (`leadership`, `hr`, `manager`, `team-lead`,
`engineer`, `validation`, `office-worker`). Every template follows the
brief's example shape:

```
09:00 ARRIVAL
09:15 WORK
<role-appropriate time> MEETING
<+30min>   WORK
13:00      BREAK
14:00      WORK
18:00      LEAVING
18:30      OFF_DUTY
```

Meeting placement varies slightly by role (e.g. leadership's meeting
sits at 10:30, most engineering roles at 11:00) so not every NPC in the
building heads to a meeting at the exact same simulated moment — a
first layer of desynchronisation on top of the per-NPC seeded offset
below.

## Deterministic seeded variation

`seededScheduleOffset(npcId, blockIndex, rangeMinutes = 6)` — a small
djb2-hash-based function producing a value in `[-6, +6]` minutes,
**deterministic** for a given `(npcId, blockIndex)` pair (same inputs
always produce the same offset — required for reproducible tests) but
**different across NPCs** sharing the same template, so a room full of
engineers doesn't all stand up for a break in the same video-game
frame. `resolveScheduleActivity(template, npcId, worldTimeMinutes)`
applies this offset to every block's nominal start time before
resolving which activity is currently active.

## Role-aware behaviour

Section 13 of the brief's role guidance is expressed through which
schedule template an NPC uses (`NPCProfile.scheduleTemplateId` in
`content/npcs.json`) plus the role metadata in `npcRoles.ts`
(`meetingEligible`, `dialogueCategory`, etc.) — not through separate
per-role behaviour code paths. This keeps the schedule/behaviour system
generic: adding a new role mostly means adding a new template entry and
a metadata row, not new branching logic in the orchestrator.

## Work sub-state cycling

While an NPC's schedule activity is `WORK`, `useNpcStore`'s
`decideNpcStep` cycles the NPC through `SITTING → WORKING → TYPING ⇄
THINKING` — one state-machine step per tick, so an NPC doesn't just sit
motionless; it visibly alternates between "typing" and "thinking"
sub-states for the whole work block, matching "use believable state
variation... do not switch animation every second" (each step is one
event per tick, and ticks only fire meaningful transitions when the
prior transition has had time to be visible in practice, since most
ticks for a settled NPC are no-ops until the schedule or navigation
state actually changes).

## Known limitations

- Only one "MEETING" schedule block per role per day is modelled (no
  recurring/weekly pattern) — appropriate for a portfolio demo, not a
  real calendar system.
- Break duration is a fixed 15 simulated minutes
  (`useNpcStore`'s `setBreakUntil: worldTimeMinutes + 15`), not
  role- or seed-varied.
