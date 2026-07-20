# Project Memory

## What this is

**Marimuthu Rajagopal — Interactive Portfolio**: a realistic, browser-based,
third-person 3D open-world portfolio site. `/` is a conventional 2D portfolio
landing page; `/city` is a full 3D world (Next.js + React Three Fiber) — an
office you walk around, NPCs you can talk to, an embedded-firmware IDE you can
use, and a drivable-vehicle city block outside.

No backend, no database, no external API calls, no third-party AI — everything
(dialogue, firmware simulation) runs fully client-side/offline. Static export
deploy target.

## Stack

- Next.js 16 (App Router), TypeScript, React 19
- `@react-three/fiber` + `@react-three/drei` (Three.js) for 3D
- Zustand for state (4 stores — see ARCHITECTURE.md)
- Vitest + Testing Library for unit tests; ESLint (Next.js/React config)
- No Rapier/physics engine yet — collision is a bespoke circle-vs-AABB resolver (see ADR_001)

## Entry points

- `src/app/page.tsx` — 2D portfolio landing page
- `src/app/city/page.tsx` → `world/Experience.tsx` / `world/Scene.tsx` — the 3D world (client-only, `ssr:false` via `SceneLoader.tsx`)

## Repo layout at a glance

```
src/
  app/          Next.js routes (/, /city)
  engine/       core (capability detection), input, interaction
  navigation/   zone-graph pathfinding
  world/        office/ and city/ scene composition
  player/       player capsule, movement, camera, animation state
  characters/   NPC identity/state/schedule, teams
  vehicles/     drivable vehicles (arcade physics)
  dialogue/     offline structured dialogue engine
  simulations/embedded/  firmware build/flash/board/GPIO simulation
  ui/           HUD, dialogue UI, embedded IDE overlay, 2D portfolio page
  state/        4 Zustand stores
  config/       profile.ts, workplace.ts, quality.ts
  content/      npcs.json, teams.json, dialogue/*.json, portfolio/*.ts
```

Full detail: [ARCHITECTURE.md](ARCHITECTURE.md) → [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## Key non-obvious facts (why, not what)

- **Fictional content policy**: every NPC identity, the office layout, and
  workplace details are invented/fictionalized — real private info is left as
  `TODO_USER_INPUT` in `src/config/profile.ts`/`workplace.ts` rather than
  fabricated. See `docs/PRIVACY_REVIEW.md` before adding any "real" detail.
- **Embedded IDE is a full simulation** — no real compiler/debugger/hardware
  anywhere, by design (portfolio demo, not a dev tool). See
  `docs/EMBEDDED_SIMULATION.md` "Simulation boundary".
- **Only 2 avatar meshes exist** (Renderpeople free tier) — all 10 NPCs +
  player reuse them, differentiated by clothing tint only. A richer avatar
  pipeline is deferred (Milestone 2, not started).
- **Milestone tracker is slightly behind actual code**: `docs/ROADMAP.md`
  marks Milestone 9 (vehicles/traffic) as NOT STARTED, but drivable vehicles,
  traffic, and pedestrians are already implemented (`src/vehicles/`,
  `src/world/city/`, `docs/CITY_WORLD.md`) — same pattern as the animation
  state machine being pulled forward in Milestone 3. See
  [STATUS.md](STATUS.md) and [BUGS.md](BUGS.md).

## Where to go next

- Module-level detail → [ARCHITECTURE.md](ARCHITECTURE.md)
- What's done vs. not → [FEATURES.md](FEATURES.md)
- Current build/test state → [STATUS.md](STATUS.md)
