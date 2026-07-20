# Architecture (memory index)

Full authoritative doc: [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).
This file is a lookup table — find your module, jump straight to the doc + source.

| Module | Source | Doc |
|---|---|---|
| Rendering bootstrap, capability detection, quality profiles | `src/engine/core/`, `src/config/quality.ts` | `docs/PERFORMANCE.md` |
| Input (keyboard + touch, unified `InputManager`) | `src/engine/input/` | `docs/MOBILE_CONTROLS.md` |
| Interaction targeting (doors/chairs/NPCs/vehicles) | `src/engine/interaction/` | `docs/INTERACTION_SYSTEM.md` |
| Player locomotion, collision, camera, animation state | `src/player/` | `docs/PLAYER_SYSTEM.md`, `docs/ANIMATION_SYSTEM.md` |
| Office world (layout, doors, collision, rooms/props) | `src/world/office/` | `docs/OFFICE_WORLD.md` |
| City world (roads, buildings, pedestrians, traffic) | `src/world/city/` | `docs/CITY_WORLD.md` |
| Drivable vehicles (arcade physics, enter/drive/exit) | `src/vehicles/` | `docs/CITY_WORLD.md` |
| NPCs (identity, 12-state state machine, workstation assignment) | `src/characters/npc/`, `src/world/office/npc/` | `docs/NPC_SYSTEM.md` |
| Teams | `src/characters/teams/` | `docs/TEAM_SYSTEM.md` |
| Navigation (zone-graph BFS pathfinding) | `src/navigation/` | `docs/NAVIGATION_SYSTEM.md` |
| NPC schedules / world clock | `src/characters/npc/schedule.ts` | `docs/NPC_SCHEDULES.md` |
| Dialogue engine + content | `src/dialogue/`, `src/content/dialogue/*.json` | `docs/DIALOGUE_SYSTEM.md` |
| Embedded firmware simulation (build/flash/board/GPIO/runtime) | `src/simulations/embedded/` | `docs/EMBEDDED_SIMULATION.md`, `docs/VIRTUAL_BOARD.md` |
| Embedded IDE overlay UI | `src/ui/workstation/` | `docs/WORKSTATION_IDE.md` |
| Portfolio content data layer (typed skills/projects/experience) | `src/portfolio/`, `src/content/portfolio/` | `docs/PORTFOLIO_CONTENT.md` |
| 2D portfolio landing page | `src/ui/portfolio/PortfolioPage.tsx` | `docs/PORTFOLIO_CONTENT.md` |
| HUD / loading screen / dialogue overlay | `src/ui/` | — |
| State (Zustand) | `src/state/` | see below |
| Engine choice rationale | — | `docs/ADR_001_3D_ENGINE_SELECTION.md` |

## State stores (Zustand)

- `useAppStore` — quality profile, device class
- `useOfficeStore` — doors, chairs, workstation mode, current zone, interaction prompt, shared player animation state
- `useEmbeddedStore` — firmware task state machine, build/flash logs, virtual board/GPIO, achievements
- `useNpcStore` — world clock, per-NPC runtime state, workstation reservations, active dialogue session

Stores talk to each other only via explicit orchestration calls (e.g.
`useEmbeddedStore` → `useOfficeStore.requestCelebration()`), never by polling
each other's internals. Frame-by-frame locomotion state stays in R3F refs, not
Zustand (avoids per-frame React re-renders) — the one exception is seated
state (rare, shared).

## Rendering pipeline notes

- `/city` mounts `Canvas` client-only via `SceneLoader.tsx` (`next/dynamic`,
  `ssr:false`) — WebGL cannot run server-side.
- `Scene.tsx` runs `detectCapability()` once; falls back to
  `PortfolioFallback` if WebGL2 unsupported.
- Quality profile (LOW/MEDIUM/HIGH/ULTRA) auto-selected from device
  heuristics, overridable + persisted to `localStorage`.
- No physics engine (Rapier evaluated in ADR_001, not adopted) — collision is
  a bespoke circle-vs-AABB resolver (`world/office/collision.ts`).

**When a change touches system design** (not just a bugfix), update the
relevant `docs/*.md` file directly — this file stays a pointer table, not a
duplicate.
