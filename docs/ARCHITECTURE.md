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

- `Canvas` (R3F) is mounted client-side only (`dynamic(() => import(...), { ssr: false })`)
  since WebGL cannot run during Next.js server rendering.
- A `CapabilityGate` component runs a WebGL2 feature probe before mounting
  the Canvas. If probing fails, the app renders `PortfolioFallback` (a
  static 2D responsive page) instead, per section 17/19.
- `QualityProfile` (LOW/MEDIUM/HIGH/ULTRA) is auto-selected from device
  memory, GPU tier heuristics (renderer string via `WEBGL_debug_renderer_info`
  where available), and viewport size, with a manual override stored in
  Zustand + persisted to `localStorage`.

## Input architecture

`InputManager` is a framework-agnostic class that normalizes keyboard,
pointer, and touch events into a single `InputState` (movement vector,
run flag, interact/sit triggers, camera delta). `MobileInputController`
(virtual joystick + touch look) and the desktop keyboard/mouse listeners
both write into the same `InputManager`, so `PlayerController` never
branches on device type. Device type is only used to decide which HUD
control widgets render.

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
`InputManager` (state derivation from raw events), and player movement
math (`computeNextPlayerState(state, input, dt)`), exercised with Vitest.
