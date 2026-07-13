# NPC System (Milestone 5)

## Fictional identity policy (read this first)

Every NPC shipped with this project (`src/content/npcs.json`) is a
**fictional, public-safe identity** — invented names, invented roles
attached to invented people. None reference, resemble, or are derived
from real colleagues, real employee data, real faces, or confidential
organisational information. Real identities may only ever be introduced
through explicit user-supplied configuration, never generated
automatically. See `docs/PRIVACY_REVIEW.md`.

## Roles

`src/characters/npc/npcRoles.ts` — a closed `NPCRole` union (`CEO`,
`HR`, `MANAGER`, `TEAM_LEAD`, `EMBEDDED_FIRMWARE_ENGINEER`,
`EMBEDDED_SYSTEMS_ENGINEER`, `SOFTWARE_ENGINEER`,
`TEST_VALIDATION_ENGINEER`, `OFFICE_WORKER`), each with typed
`RoleMetadata` (default department, preferred work zone, dialogue
category, meeting eligibility, workstation type). Behaviour dispatches
on this enum everywhere — never on a display-name string comparison.

## Architecture

```
characters/
  npc/
    npcRoles.ts           Role enum + metadata
    npcState.ts            State machine (pure, tested)
    NPCProfile.ts           Identity/config model + validation
    npcContent.ts           Loads + validates content/npcs.json + content/teams.json
    workstationAssignment.ts  Reservation logic (pure, tested)
    schedule.ts              Schedule templates + deterministic timing (pure, tested)
    meeting.ts                Meeting/discussion lifecycle (pure, tested)
    useNpcInteractables.ts    TALK_TO_NPC candidate builder (React hook)
  teams/
    Team.ts                 Team model + validation (pure, tested)
navigation/
  navigationTargets.ts       Typed target registry
  navigationGraph.ts          Zone adjacency + BFS pathfinding (pure, tested)
  NavigationAgent.ts           Path-following stepper (pure, tested)
dialogue/
  DialogueSystem.ts          Node/choice traversal (pure, tested)
  dialogueContent.ts          Loads + validates content/dialogue/*.json
state/
  useNpcStore.ts              Orchestration: world clock, per-NPC behaviour
                               ticking, workstation reservations, dialogue
                               sessions — the integration layer that ties
                               every pure module above together
world/office/npc/
  NPCInstance.tsx             Per-NPC 3D capsule + label
  OfficeNpcPopulation.tsx     Ticks useNpcStore, renders active NPCs
ui/dialogue/
  DialogueUI.tsx              Dialogue overlay (desktop + mobile)
```

Each concern (identity, state, navigation, schedule, workstation,
dialogue, rendering) is its own module — there is no single
"NPCManager" god class. `useNpcStore.tick()` is the one place that
reads across modules to decide, once per NPC per tick, which single
state-machine event to apply next (see "Behaviour orchestration"
below) — everything it calls into (the reducer, the navigation
stepper, the schedule resolver, the workstation reservation functions)
remains independently pure and unit-tested.

## Config validation

`npcContent.ts` and `dialogueContent.ts` both validate their JSON
content at import time (`validateNpcProfiles`, `validateTeams`,
`validateDialogueProfile`) and log `console.error` for any `ERROR`
diagnostic in development. Critically, **one invalid NPC or team
reference does not crash the whole simulation** —
`selectValidNpcProfiles` filters bad entries out of the active roster,
matching "if one NPC is invalid, report diagnostics, do not crash the
complete office simulation where safe recovery is possible."

## State machine

See `src/characters/npc/npcState.ts`. Twelve states:
`SPAWNING → IDLE → WALKING → SITTING → WORKING → TYPING ⇄ THINKING`,
plus `MEETING`, `BREAK`, `LEAVING → OFF_DUTY → SPAWNING` (next shift),
and `TALKING` as a special interruption state.

`TALKING` is handled outside the static transition table because it
needs to **return to whatever state was active before the
interruption** — a static from→to table can't express "go back to
wherever you came from." `reduceNpcState` takes an explicit
`resumeState` parameter (threaded through by `useNpcStore`) so the
reducer stays pure while still supporting this. Interruption is only
permitted from `IDLE`/`WALKING`/`SITTING`/`WORKING`/`TYPING`/
`THINKING`/`BREAK` — not from `MEETING` or `LEAVING` (an NPC mid-meeting
or already heading out for the day won't stop to chat).

## Avatar variation

Player and NPCs now render as real human models (Renderpeople free-tier
FBX assets — see `docs/ASSET_PIPELINE.md` "Renderpeople asset
attribution" for the license verification and file details), replacing
the earlier capsule placeholder. Only **two** distinct people are
available at the free tier with usable baked animation ("Nathan,"
walking; "Sophia," idling) — every player/NPC instance is one of these
two, deterministically assigned via `pickAvatarVariant(npcId)`
(`characters/avatar/avatarConfig.ts`) and differentiated by a
per-character clothing tint (`pickTintColor(npcId)`) rather than being
a unique scan each. `NPCProfile.avatarVariant` (the JSON field) is not
currently read by the rendering path — variant assignment is derived
from `npcId` directly — but remains in the data model as a documented
seam for a future richer avatar library.

Each model ships with exactly **one** baked animation clip (no separate
idle/walk/sit/type/talk/celebrate set) — `PersonAvatar.tsx`
(`characters/avatar/PersonAvatar.tsx`) plays it when appropriate
(Nathan's walk clip while `WALKING`; Sophia's idle clip always) and
otherwise holds the last-reached frame as a static pose. Seated states
(`SITTING`/`WORKING`/`TYPING`/`THINKING`/`MEETING`/`BREAK`) currently
still render the character standing at the seat/desk position — there
is no sit animation clip available at the free tier. This is a
documented, honest limitation, not a fabricated animation.

## Behaviour orchestration

`useNpcStore.tick(dt)` runs once per frame for every currently
budgeted NPC (see "Density scaling" below) and, per NPC, applies **at
most one** state-machine event per tick via `decideNpcStep` — a
schedule-activity-aware decision function that looks at the NPC's
current state, its schedule-resolved target activity
(`resolveScheduleActivity`), and whether its navigation agent has
arrived at its pending target, and returns the single next event
(plus any navigation/workstation side effects) to apply. This
single-step-per-tick design is what makes an NPC's day play out as a
believable sequence (spawn → walk → sit → work → occasionally
walk to a meeting/break → work again → leave) rather than teleporting
between states.

## Density scaling & update budgets

`useNpcStore.setActiveBudget(qualityLevel)` selects a prefix of the
fixed NPC roster sized by `QUALITY_PROFILES[level].npcBudget`
(`config/quality.ts`, already defined since Milestone 1): `LOW` → 0
NPCs (none spawn at all), `MEDIUM` → up to 10, `HIGH` → 30, `ULTRA` →
60 (bounded in practice by the actual roster size, 10 NPCs). Only
`activeNpcIds` are ticked or rendered — dormant NPCs cost nothing.
`OfficeNpcPopulation.tsx` re-applies the budget whenever the active
`QualityLevel` changes.

Within the active set, `tick()` still runs every render frame (cheap:
one state-machine step decision + one navigation-agent step per NPC,
no allocation unless a transition actually fires), but the *state
machine step* itself is naturally throttled — most ticks for a given
NPC are no-ops (waiting to arrive, waiting for the schedule to move
on) rather than genuinely making a decision every frame. A true
fixed-interval decision throttle (e.g. only re-evaluating every 300ms)
was evaluated and deferred: the roster is small enough (≤10 active
NPCs) that per-frame evaluation of a handful of cheap comparisons is
not currently a measured bottleneck; see "Known limitations."

## NPC interaction (TALK_TO_NPC)

See `docs/DIALOGUE_SYSTEM.md`.
