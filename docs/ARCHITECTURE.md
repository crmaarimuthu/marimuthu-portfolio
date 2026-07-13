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
    navigation/         NPC pathfinding (future milestones)
    audio/             Web Audio adapters (future milestones)
  world/
    office/            Office world — Milestone 3 (see docs/OFFICE_WORLD.md)
      rooms/ props/    Room-specific assembly / reusable furniture & door props
    city/ home/ traffic/ environment/   (future milestones)
  player/
    PlayerCapsule, PlayerConfig, playerMovement, animationState,
    CameraController, InteractionController
  characters/
    player/ npc/        Avatar integration layer (future — not yet implemented)
  vehicles/            (future milestones)
  dialogue/            (future milestones)
  portfolio/           Config-driven content panels (future milestones)
  simulations/
    embedded/ can/ modbus/ ems/ bms/            (future milestones)
  ui/                  HUD, loading screen, menus, 2D fallback shell
  state/               Zustand stores (useAppStore, useOfficeStore)
  config/              profile.ts, workplace.ts, quality.ts
  content/             profile.json and other structured content (future)
```

Directories for later milestones are not created until needed, per the
"avoid unnecessary overengineering" rule in section 21 of the brief.
`engine/physics/` (Rapier) is intentionally still empty — Milestone 3's
office collision is a bespoke circle-vs-AABB resolver
(`world/office/collision.ts`), which is cheaper and sufficient for a
single flat floor; a full physics engine is deferred until vehicles or
more complex terrain need it.

## State management

Two Zustand stores:

- `state/useAppStore.ts` — quality profile, device class.
- `state/useOfficeStore.ts` (Milestone 3) — door states, chair
  reservation/occupancy, workstation mode, current zone, and the active
  interaction prompt. This is genuinely cross-cutting state: the HUD,
  `Door` props, `InteractionController`, and `PlayerCapsule` all need to
  read or react to it, and it changes rarely (on explicit player
  action) — unlike locomotion.

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

## Testing boundaries

Per section 22, rendering itself is not unit tested. Pure logic is
extracted into testable modules with no Three.js/R3F dependency:
`InputManager` (state derivation from raw events), player movement math
(`computeNextPlayerTransform`), the animation state machine
(`nextAnimationState`/`isTransitionAllowed`/sit-stand transitions),
quality selection and persistence, joystick dead-zone/clamp math,
office zone classification (`resolveOfficeZone`), the door state
machine (`reduceDoorState`), chair reservation/occupancy
(`requestSit`/`requestStand`/...), workstation mode
(`requestUseWorkstation`/`exitWorkstation`), interaction target
selection (`selectBestInteractable`), and wall collision
(`resolveWallCollisions`/`isPointBlocked`) — 91 tests as of Milestone 3.

## Related documentation

- `docs/PLAYER_SYSTEM.md` — locomotion states, collision, config
- `docs/ANIMATION_SYSTEM.md` — animation state machine detail
- `docs/OFFICE_WORLD.md` — office layout, doors, collision, camera
- `docs/INTERACTION_SYSTEM.md` — target selection, chair/workstation flow
- `docs/MOBILE_CONTROLS.md` — touch input architecture in detail
- `docs/PERFORMANCE.md` — quality profile fields, DPR capping,
  visibility-based frameloop, reduced-motion handling, office instancing
- `docs/ASSET_PIPELINE.md` — current (procedural-only) asset status
