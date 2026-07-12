# ADR 001: 3D Engine Selection

Status: Accepted
Date: 2026-07-12

## Context

The project requires a browser-based, realistic, playable third-person 3D
open-world experience: a large streamed city, a navigable office interior,
NPCs with pathfinding, a character controller with an animation state
machine, vehicles with basic physics, and an embedded-firmware minigame —
all running acceptably on mobile, tablet, laptop, desktop, and large
displays. The stack must also host a conventional 2D fallback and integrate
with a React-based UI layer for HUD, dialogue, and menus.

Four options were evaluated: Three.js (raw), React Three Fiber (R3F),
Babylon.js, and PlayCanvas.

## Evaluation

| Criteria | Three.js (raw) | React Three Fiber | Babylon.js | PlayCanvas |
|---|---|---|---|---|
| Mobile performance | Good, manual tuning required | Same as Three.js (thin wrapper) | Good, built-in scene optimizer | Good, built for mobile web games |
| Large-world architecture | DIY (scenes, streaming) | DIY, same primitives | Built-in scene/asset containers, LOD | Built-in scene hierarchy, streaming via editor |
| Character animation | Manual AnimationMixer wiring | `useAnimations` helper over AnimationMixer | Robust animation/skeleton system | Solid animation state graph in editor |
| Physics | BYO (Rapier/Cannon via manual glue) | `@react-three/rapier` (mature) | Built-in physics plugin (Havok/Cannon/Ammo) | Built-in (Ammo) |
| Navigation/pathfinding | BYO (recast/Yuka) | Same, via hooks | Recast plugin available | Built-in navmesh tools |
| Asset loading (GLTF/Draco/KTX2/Meshopt) | Manual loader setup | `useGLTF`/`drei` wraps loaders, supports Draco/Meshopt/KTX2 | Native loaders, strong compression support | Native, editor-driven pipeline |
| Developer experience | Verbose, imperative | Declarative, composes with React state/hooks | Good but non-React (imperative API bridged into React awkwardly) | Editor-centric; scripting API less natural in a code-first/React repo |
| React integration | None (manual bridging) | Native — first-class | Requires a bridge layer (extra glue code, dual mental models) | Requires a bridge layer, weaker TS story for React apps |
| Deployment complexity | Low (bundle JS assets) | Low, same as Three.js, fits Next.js SSR/CSR split cleanly | Low-medium (larger core bundle) | Medium (often paired with PlayCanvas cloud/editor workflow) |
| Ecosystem for this exact use case (drei helpers: KeyboardControls, PointerLockControls, gltf inspection, instancing, LOD, environment) | N/A (would build drei's helpers by hand) | `@react-three/drei` covers most needs directly | Equivalent features exist but require Babylon-specific idioms | Equivalent features exist but tied to PlayCanvas project format |

## Decision

**React Three Fiber (Three.js + R3F + drei + @react-three/rapier), on
Next.js with TypeScript.**

Reasoning:

- The rest of the application (HUD, dialogue UI, menus, portfolio content
  panels, quality settings) is naturally a React app. R3F lets the 3D scene
  graph and React component/state tree be the same tree, avoiding a second
  imperative scene-management layer bridged awkwardly into React (the cost
  Babylon.js and PlayCanvas both carry here).
- `@react-three/drei` directly supplies a large fraction of what the spec
  requires out of the box: GLTF loading with Draco/Meshopt/KTX2, instancing,
  LOD, environment/lighting helpers, keyboard controls, and camera rigs —
  reducing custom engine code versus raw Three.js.
- `@react-three/rapier` gives production-grade, WASM-based physics
  (character controllers, vehicle-ish rigid bodies) with a React-idiomatic
  API, comparable in capability to Babylon's or PlayCanvas's built-in
  physics.
- Next.js gives routing, code-splitting, and a clean place to host the 2D
  portfolio fallback alongside the 3D experience (required by section 18).
- Raw Three.js was rejected only because R3F is a thin, near-zero-cost
  wrapper over it — every Three.js API remains available via `useThree`/refs,
  so nothing is lost, while React composition is gained.
- Babylon.js and PlayCanvas were rejected primarily on developer experience
  and React-integration grounds for *this* codebase: both are excellent
  engines, but bridging their imperative scene APIs into a React/Next.js app
  adds a persistent translation layer this project doesn't need. If a future
  milestone demands features R3F's ecosystem can't reasonably cover
  (e.g. a heavyweight built-in navmesh/streaming editor), this ADR should be
  revisited.

## Consequences

- Navigation/pathfinding (NPCs, milestone 5) will require an explicit
  library choice (e.g. Yuka or recast-navigation-js compiled to WASM) since
  R3F does not include one — tracked as a follow-up decision at that
  milestone.
- Large-world streaming (city, milestone 7+) will be implemented manually via
  React Suspense boundaries, zone components, and manual LOD/culling — no
  built-in world-streaming editor exists in this stack, unlike PlayCanvas.
  This is an accepted tradeoff for the React-native developer experience.
- WebGPU: `three` supports an experimental WebGPU renderer; R3F can swap
  renderers. Given current stability, this project targets WebGL2 first with
  a WebGPU upgrade path left open, per section 16.
