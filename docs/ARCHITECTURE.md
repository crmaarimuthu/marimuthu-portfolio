# Architecture

## Stack (see ADR_001)

Next.js (App Router) + TypeScript + React Three Fiber (Three.js) +
`@react-three/drei` + `@react-three/rapier` (physics, from Milestone 2+).

## Top-level module layout

```
src/
  app/                 Next.js routes, layout, page shell
  engine/
    core/              Renderer/canvas bootstrap, capability detection
    rendering/         Quality profiles, LOD, lighting rigs
    physics/           Rapier world setup (later milestones)
    animation/         Animation state machine primitives
    navigation/         NPC pathfinding (later milestones)
    audio/             Web Audio adapters (later milestones)
    input/             InputManager, MobileInputController, gamepad hook points
  world/
    city/ office/ home/ traffic/ environment/   (future milestones)
  player/
    PlayerController, CameraController, InteractionController
  characters/
    player/ npc/        Avatar integration layer (future milestones)
  vehicles/            (future milestones)
  interactions/
  dialogue/            (future milestones)
  portfolio/           Config-driven content panels (future milestones)
  simulations/
    embedded/ can/ modbus/ ems/ bms/            (future milestones)
  ui/                  HUD, loading screen, menus, 2D fallback shell
  state/               Zustand stores
  config/              profile.ts, workplace.ts, quality.ts
  content/             profile.json and other structured content (future)
  utils/
```

Milestone 1 only populates: `app/`, `engine/core`, `engine/rendering`
(quality profiles only), `engine/input`, `player/` (capsule +
controllers), `ui/` (loading screen, fallback), `config/`, `state/`.
Directories for later milestones are not created until needed, per the
"avoid unnecessary overengineering" rule in section 21 of the brief.

## State management

Zustand is used for cross-cutting client state that both the 3D scene and
the 2D HUD need to read/write (input state, quality profile, capability
result, player transform summary). Local, frame-by-frame physics state
(position deltas, velocity) stays inside R3F `useFrame` refs and is not
pushed into Zustand every frame, to avoid unnecessary React re-renders.

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

Milestone 1 uses a capsule collider... actually, no physics engine yet in
Milestone 1 (Rapier is introduced at Milestone 2 per the roadmap). The
Milestone 1 capsule uses simple kinematic movement (position integration
with a ground-plane clamp) driven by `InputManager` state, with a
third-person spring-arm style `CameraController` that follows the capsule
with damped rotation/position.

## Testing boundaries

Per section 22, rendering itself is not unit tested. Pure logic is
extracted into testable modules with no Three.js/R3F dependency:
`InputManager` (state derivation from raw events), player movement math
(`computeNextPlayerTransform(current, input, dt)`), the animation state
machine (`nextAnimationState`/`isTransitionAllowed`), quality selection
and persistence (`selectInitialQualityLevel`,
`persistQualityOverride`/`readPersistedQualityOverride`), and joystick
dead-zone/clamp math (`normalizeJoystickDelta`) — all exercised with
Vitest (32 tests as of Milestone 1).

## Related documentation

- `docs/MOBILE_CONTROLS.md` — touch input architecture in detail
- `docs/PERFORMANCE.md` — quality profile fields, DPR capping,
  visibility-based frameloop, reduced-motion handling
