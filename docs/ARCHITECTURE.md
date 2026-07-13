# Architecture

## Stack (see ADR_001)

Next.js (App Router) + TypeScript + React Three Fiber (Three.js) +
`@react-three/drei`. `@react-three/rapier` was evaluated in ADR_001 but
has not been added yet — Milestone 3's office collision uses a bespoke
circle-vs-AABB resolver instead (see docs/OFFICE_WORLD.md), which is
cheaper for a single flat floor; a full physics engine remains an option
for a future milestone (e.g. vehicles) if the need arises.

## Top-level module layout

```
src/
  app/                 Next.js routes, layout, page shell
  engine/
    core/              Renderer/canvas bootstrap, capability detection
    input/             InputManager, useKeyboardInput
    interaction/       InteractionSystem (target selection) — Milestone 3
    rendering/         Quality profiles, LOD, lighting rigs (future)
    physics/           Rapier world setup (future — not needed yet; collision is a custom AABB resolver, see docs/OFFICE_WORLD.md)
    audio/             Web Audio adapters (future milestones)
  navigation/          Zone-graph pathfinding + navigation agent — Milestone 5 (see docs/NAVIGATION_SYSTEM.md)
  world/
    office/            Office world — Milestone 3 (see docs/OFFICE_WORLD.md)
      rooms/ props/    Room-specific assembly / reusable furniture & door props
      npc/             NPC 3D rendering + population ticking — Milestone 5
    city/ home/ traffic/ environment/   (future milestones)
  player/
    PlayerCapsule, PlayerConfig, playerMovement, animationState,
    CameraController, InteractionController
  characters/
    npc/               NPC identity, state machine, schedule, workstation
                        assignment, meetings — Milestone 5 (see docs/NPC_SYSTEM.md)
    teams/             Team model + validation — Milestone 5 (see docs/TEAM_SYSTEM.md)
    player/            Avatar integration layer (future — not yet implemented)
  vehicles/            (future milestones)
  dialogue/            Structured offline dialogue system — Milestone 5 (see docs/DIALOGUE_SYSTEM.md)
  portfolio/           Config-driven content panels (future milestones)
  simulations/
    embedded/          Firmware/build/flash/board/GPIO/runtime domain logic — Milestone 4 (see docs/EMBEDDED_SIMULATION.md)
    can/ modbus/ ems/ bms/            (future milestones)
  ui/
    workstation/       Embedded IDE overlay (CodeViewer, Build/Flash/Board panels) — Milestone 4
    dialogue/          Dialogue overlay (desktop + mobile) — Milestone 5
    HUD, loading screen, 2D fallback shell
  state/               Zustand stores (useAppStore, useOfficeStore, useEmbeddedStore, useNpcStore)
  config/              profile.ts, workplace.ts, quality.ts
  content/             npcs.json, teams.json, dialogue/*.json — Milestone 5 data-driven content
```

Directories for later milestones are not created until needed, per the
"avoid unnecessary overengineering" rule in section 21 of the brief.
`engine/physics/` (Rapier) is intentionally still empty — Milestone 3's
office collision is a bespoke circle-vs-AABB resolver
(`world/office/collision.ts`), which is cheaper and sufficient for a
single flat floor; a full physics engine is deferred until vehicles or
more complex terrain need it.

## State management

Four Zustand stores:

- `state/useAppStore.ts` — quality profile, device class.
- `state/useOfficeStore.ts` (Milestone 3) — door states, chair
  reservation/occupancy, workstation mode, current zone, the active
  interaction prompt, and the shared player animation state. This is
  genuinely cross-cutting state: the HUD, `Door` props,
  `InteractionController`, and `PlayerCapsule` all need to read or react
  to it, and it changes rarely (on explicit player action) — unlike
  locomotion.
- `state/useEmbeddedStore.ts` (Milestone 4) — the embedded firmware task
  state machine, build/flash staged progression + output logs, the
  virtual board/GPIO state, and achievement/notification state. Owns
  side-effect resources (the `VirtualFirmwareRuntime` instance, staged
  `setTimeout` chains) as module-scoped variables rather than store
  state — see `docs/EMBEDDED_SIMULATION.md` "Runtime lifecycle". Calls
  into `useOfficeStore`'s animation-bridge actions
  (`requestWorkAnimation`/`requestCelebration`/`completeCelebration`) at
  explicit orchestration points rather than either store polling the
  other.
- `state/useNpcStore.ts` (Milestone 5) — the simulated world clock,
  every NPC's runtime state (state machine state, navigation agent,
  pending target), workstation reservations, and the active dialogue
  session. `tick(dt)` is called once per frame
  (`OfficeNpcPopulation.tsx`) and applies at most one state-machine
  event per active NPC per tick — see `docs/NPC_SYSTEM.md` "Behaviour
  orchestration". Reads `useOfficeStore`'s player-related state
  (indirectly, via `PlayerCapsule`/`Hud`/`InteractionController`
  checking `useNpcStore.dialogue`) but neither store depends on the
  other's internals.

Local, frame-by-frame locomotion state (position, heading, IDLE/WALK/RUN)
stays inside R3F `useFrame` refs inside `PlayerCapsule` and is *not*
pushed into Zustand every frame, to avoid unnecessary React re-renders —
see `docs/PLAYER_SYSTEM.md` for the full rationale and the one exception
(seated states, which *do* go through the store because they're rare and
genuinely shared).

## Rendering pipeline

- `Canvas` (R3F) is mounted client-side only, via `SceneLoader.tsx`'s
  `dynamic(() => import("./Scene"), { ssr: false })` — WebGL cannot run
  during Next.js server rendering, and `next/dynamic`'s `ssr: false`
  option must live in a Client Component, hence the small
  `SceneLoader` wrapper around the `Scene` implementation.
- `Scene.tsx` calls `detectCapability()` (`engine/core/capability.ts`)
  once via a lazy `useState` initializer (safe because `Scene` only ever
  mounts client-side). If `capability.supported` (WebGL2) is false, it
  renders `PortfolioFallback` instead of the Canvas — see section 17/19.
- `QualityProfile` (LOW/MEDIUM/HIGH/ULTRA, `config/quality.ts`) is
  auto-selected by `selectInitialQualityLevel()` from device memory,
  CPU concurrency, and touch/coarse-pointer + viewport heuristics —
  never from screen resolution alone. A manual override is stored in
  the Zustand store and persisted to `localStorage`
  (`persistQualityOverride`/`readPersistedQualityOverride`); on mount,
  `Scene` checks for a persisted override before running the heuristic.
- The effective device pixel ratio passed to `Canvas`'s `dpr` prop is
  `min(profile.pixelRatioCap, capability.devicePixelRatio)` — both the
  quality profile and the real hardware DPR bound it.
- `Canvas`'s `frameloop` toggles `"always"`/`"never"` on the Page
  Visibility API so a backgrounded tab stops rendering; see
  `docs/PERFORMANCE.md`.

## Input architecture

`InputManager` (`engine/input/InputManager.ts`) is a framework-agnostic
class that normalizes keyboard and touch/joystick input into a single
`InputState` (movement vector, run flag, interact/sit one-shot
triggers, camera look delta). `useKeyboardInput` (desktop) and
`VirtualJoystick` (mobile, backed by pure dead-zone/clamp math in
`ui/joystickMath.ts` — see `docs/MOBILE_CONTROLS.md`) both write into
the same `InputManager` instance, so `PlayerCapsule` never branches on
device type; `useDeviceClass` is used purely to decide which HUD
widgets render.

## Player controller

See `docs/PLAYER_SYSTEM.md` for full detail. Summary: `PlayerCapsule`
uses simple kinematic movement (`computeNextPlayerTransform`) plus a
custom circle-vs-AABB collision resolver against the office's wall list
(no physics engine); it also owns the seated-interaction lerp (Milestone
3) driven by `useOfficeStore.pendingTransition`. `CameraController`
follows the capsule with damped position/rotation and reduces its
offset indoors (see `docs/OFFICE_WORLD.md`).

## Interaction system (Milestone 3)

See `docs/INTERACTION_SYSTEM.md`. Summary: `InteractionController` runs
once per frame, resolves the nearest valid interactable via
`selectBestInteractable` (`engine/interaction/InteractionSystem.ts`),
and dispatches into `useOfficeStore` (doors, chair sit/stand,
workstation mode). The HUD reads `useOfficeStore.interactionPrompt`
directly — no prop drilling from the 3D scene into the DOM HUD.

## Embedded firmware simulation (Milestone 4)

See `docs/EMBEDDED_SIMULATION.md`, `docs/VIRTUAL_BOARD.md`, and
`docs/WORKSTATION_IDE.md`. Summary: entering workstation mode (Milestone
3's `USE_WORKSTATION`) mounts `WorkstationIDE.tsx` (a DOM overlay, same
pattern as `Hud.tsx`), which drives `useEmbeddedStore` through a
deterministic task state machine (`NOT_STARTED → … → COMPLETED`)
layered over independent build/flash staged-progression simulators, a
pure virtual board/GPIO reducer, and a timer-driven
`VirtualFirmwareRuntime`. The 3D LED (`EmbeddedBoard3D.tsx`) reads GPIO
state directly from the store every frame — it has no animation state
of its own. Nothing in this subsystem compiles, flashes, or executes
real code; see `docs/EMBEDDED_SIMULATION.md` "Simulation boundary".

## NPCs, navigation, schedules, teams, and dialogue (Milestone 5)

See `docs/NPC_SYSTEM.md`, `docs/NAVIGATION_SYSTEM.md`,
`docs/NPC_SCHEDULES.md`, `docs/TEAM_SYSTEM.md`, and
`docs/DIALOGUE_SYSTEM.md`. Summary: a fixed, fictional 10-NPC roster
(`content/npcs.json`) each run a role-aware schedule
(`characters/npc/schedule.ts`) that drives a 12-state NPC state machine
(`characters/npc/npcState.ts`) through a zone-graph navigation system
(`navigation/`) to workstations, meetings, and breaks. `TALK_TO_NPC`
extends the Milestone 3 interaction system; conversations run through a
structured offline dialogue tree (`dialogue/`) with no external AI
dependency, suspending player movement for the duration.

## Testing boundaries

Per section 22, rendering itself is not unit tested. Pure logic is
extracted into testable modules with no Three.js/R3F dependency:
`InputManager` (state derivation from raw events), player movement math
(`computeNextPlayerTransform`), the animation state machine
(`nextAnimationState`/`isTransitionAllowed`/sit-stand/work-activity
transitions), quality selection and persistence, joystick dead-zone/
clamp math, office zone classification (`resolveOfficeZone`), the door
state machine (`reduceDoorState`), chair reservation/occupancy
(`requestSit`/`requestStand`/...), workstation mode
(`requestUseWorkstation`/`exitWorkstation`), interaction target
selection (`selectBestInteractable`), wall collision
(`resolveWallCollisions`/`isPointBlocked`), the embedded task state
machine (`reduceEmbeddedTaskState`), build/flash validation and staged
progression, the virtual board/GPIO reducers, the timer-driven firmware
runtime (via `vi.useFakeTimers`), the task success evaluator, achievement
persistence, a full integration test driving the embedded store
end-to-end, the NPC state machine, team validation, navigation graph
BFS + agent stepping, workstation reservation, schedule resolution +
seeded variation, meeting/discussion lifecycle, dialogue node/choice
traversal + bundled-content validation, and a full integration test
driving `useNpcStore` end-to-end (density scaling, schedule-driven
behaviour ticking, dialogue start/choose/end) — 249 tests as of
Milestone 5.

## Related documentation

- `docs/PLAYER_SYSTEM.md` — locomotion states, collision, config
- `docs/ANIMATION_SYSTEM.md` — animation state machine detail
- `docs/OFFICE_WORLD.md` — office layout, doors, collision, camera
- `docs/INTERACTION_SYSTEM.md` — target selection, chair/workstation flow
- `docs/EMBEDDED_SIMULATION.md` — firmware/build/flash/board/GPIO/runtime
- `docs/VIRTUAL_BOARD.md` — board/GPIO model and 3D LED binding
- `docs/WORKSTATION_IDE.md` — IDE layout, shortcuts, mobile tabs
- `docs/NPC_SYSTEM.md` — NPC architecture, state machine, identity policy
- `docs/NAVIGATION_SYSTEM.md` — zone graph, pathfinding, agent stepping
- `docs/NPC_SCHEDULES.md` — world clock, schedule templates, seeded variation
- `docs/TEAM_SYSTEM.md` — team model, validation, team-lead behaviour
- `docs/DIALOGUE_SYSTEM.md` — dialogue content, flow, mobile UI
- `docs/MOBILE_CONTROLS.md` — touch input architecture in detail
- `docs/PERFORMANCE.md` — quality profile fields, DPR capping,
  visibility-based frameloop, reduced-motion handling, office instancing,
  NPC density budgets
- `docs/ASSET_PIPELINE.md` — current (procedural-only) asset status
