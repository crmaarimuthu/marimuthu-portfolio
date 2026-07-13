# Animation System

## Status

The player has no skinned mesh or animation clips yet — `PlayerCapsule`
is still a capsule placeholder. This document describes the **state
machine** driving player behaviour today; it's designed so a future
avatar swap consumes the same states/transitions and just replaces how
each state is *rendered* (a clip instead of a scale/position hack).

## States (Milestone 3)

`src/player/animationState.ts`:

```
IDLE ──────┬──────► WALK ◄──────┐
   │       │         │          │
   │       └────► RUN ──────────┘
   │
   └──► SIT_DOWN ──► SITTING ──► STAND_UP ──► IDLE
```

- `IDLE` / `WALK` / `RUN` — Milestone 1 locomotion states, driven by
  `nextAnimationState(current, hasMoveInput, running)` every frame while
  the player is in `NORMAL` locomotion (see `docs/PLAYER_SYSTEM.md`).
- `SIT_DOWN` / `SITTING` / `STAND_UP` — Milestone 3 seated-interaction
  states, driven by explicit requests (`requestSitAnimation`,
  `completeSitAnimation`, `requestStandAnimation`,
  `completeStandAnimation`), not by input polling.

`isTransitionAllowed(from, to)` is the single source of truth for valid
transitions — e.g. `SIT_DOWN` can only be requested from `IDLE` (you
can't sit down mid-run), and `nextAnimationState` is a no-op whenever
the current state isn't one of `IDLE`/`WALK`/`RUN` (so a stray move-input
frame during `SITTING` can't accidentally kick the state machine back to
locomotion).

## Current visual representation (placeholder)

`PlayerCapsule.tsx` treats `SIT_DOWN`/`SITTING`/`STAND_UP` as one
"seated visual" group: the capsule's Y-scale drops to 0.72 and its
vertical position lowers, giving a rough crouch/seated silhouette. This
is explicitly a temporary stand-in — there is no interpolated sit
animation clip. When a real avatar/animation pipeline is introduced,
this is the exact seam to replace: swap the scale hack for
`AnimationMixer` clip playback keyed off the same `PlayerAnimationState`
values, with `SIT_DOWN`/`STAND_UP` durations matching
`SEAT_TRANSITION_DURATION_SEC` in `PlayerConfig.ts`.

## Ownership split

- **Locomotion states** (`IDLE`/`WALK`/`RUN`): computed and held in a
  local ref inside `PlayerCapsule`, at input cadence — never written to
  Zustand every frame (see `docs/PLAYER_SYSTEM.md` for why).
- **Seated states**: owned by `useOfficeStore.playerAnimationState`,
  because the chair (`chairState.ts`) and the animation state
  (`animationState.ts`) must change in lockstep — `useOfficeStore`'s
  `beginSit`/`completeSitTransition`/`beginStand`/`completeStandTransition`
  actions update both together in a single set() call, so they can never
  drift out of sync (e.g. chair `OCCUPIED` while animation is still
  `SIT_DOWN`).

## Future states (not implemented)

`TALK`, `TYPE`, `DEBUG`, `INSPECT_BOARD`, `CELEBRATE`, `SLEEP`, `DRIVE`
are all named in the overall project brief for later milestones
(embedded firmware task, NPC dialogue, home/sleep, vehicles). They are
intentionally absent from `ALLOWED_TRANSITIONS` until those milestones
need them — extend the table, don't replace it, per the module's own
header comment.
