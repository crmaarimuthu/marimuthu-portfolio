# Performance

## Quality profile system

`src/config/quality.ts` defines four typed profiles (`LOW`, `MEDIUM`,
`HIGH`, `ULTRA`), each controlling:

| Field | Purpose |
|---|---|
| `pixelRatioCap` | Upper bound passed to R3F's `dpr` prop; never left uncapped |
| `shadows` / `shadowMapSize` | Real-time shadow toggle and resolution |
| `drawDistance` | Camera far plane / conceptual render distance |
| `antialias` | WebGL context antialiasing |
| `environmentDetail` | Hook for future environment prop density |
| `npcBudget` | Placeholder cap for Milestone 5's NPC count |
| `trafficBudget` | Placeholder cap for Milestone 9's vehicle/pedestrian count |
| `textureQualityHint` | Hook for future KTX2/Basis texture tier selection |
| `postProcessingAllowed` | Gate for any future post-processing stack |

`npcBudget`/`trafficBudget`/`textureQualityHint`/`postProcessingAllowed`
are read by later milestones — Milestone 1 has no NPCs, traffic, or
post-processing to budget, so these fields exist now (to avoid a
breaking config shape change later) without corresponding systems yet.

### Selection

`selectInitialQualityLevel()` (`src/config/quality.ts`) is a pure
function of device memory, CPU concurrency, mobile/touch status, and
viewport width — **never** of screen resolution alone. A 4K monitor
with 2 CPU cores and 2GB reported memory still selects `LOW`
(`quality.test.ts: "does not select ULTRA purely because of a
high-resolution viewport"`).

### Manual override + persistence

A user-selected quality level is written to `localStorage`
(`persistQualityOverride`/`readPersistedQualityOverride` in
`src/config/quality.ts`) and takes priority over auto-detection on
subsequent visits (`Scene.tsx` checks `readPersistedQualityOverride()`
before running the heuristic). `useAppStore.resetQualityOverride()`
clears it and falls back to auto-detection again.

## Renderer configuration

`src/world/Scene.tsx`:

- `dpr` is capped by `Math.min(profile.pixelRatioCap,
  capability.devicePixelRatio)` — the quality profile's cap and the
  device's actual DPR both bound the final value, so a profile
  misconfiguration can't exceed real hardware DPR and a high-DPR phone
  can't silently render at full-res-times-3.
- `frameloop` is toggled between `"always"` and `"never"` based on the
  Page Visibility API (`visibilitychange`), so a backgrounded tab stops
  driving `useFrame` entirely instead of burning CPU/GPU/battery.
- `resize={{ scroll: false }}` lets R3F's built-in `ResizeObserver`
  handle viewport/orientation changes without a bespoke resize handler.
- `gl.antialias` and `shadows` are both driven by the active profile,
  not hardcoded — `LOW`/`MEDIUM` disable both by default.

## Reduced motion

`capability.prefersReducedMotion` (from `prefers-reduced-motion: reduce`)
is threaded into `Experience` → `CameraController`: when set, the
follow camera snaps to its target position instead of damped-lerping
toward it, removing the continuous motion some users need to avoid.

## Test environment cost (Milestone 1)

`src/world/TestEnvironment.tsx` is deliberately tiny — one ground plane
and three static boxes — specifically to validate the architecture
(input → movement → camera → render) without the environment itself
being a variable in performance testing. Later milestones' city/office
content will be measured against this baseline.

## Deferred, architected-for-but-not-yet-built

Per the brief, these are **not** implemented in Milestone 1, but the
current module boundaries (`engine/rendering`, `world/`, `player/` as
separate concerns) are chosen so they can be added without restructuring:

- LOD, GPU instancing, texture compression (KTX2/Basis), Draco/Meshopt —
  relevant once real GLB assets exist (Milestone 2+).
- World zones / asset streaming — relevant once the city exists
  (Milestone 7+).
- NPC/traffic density scaling against `npcBudget`/`trafficBudget` —
  relevant once NPCs/vehicles exist (Milestones 5, 9).
- Web Workers for simulation — relevant once a simulation loop (EMS/BMS,
  Milestone 6+) exists that's heavy enough to justify moving off the
  main thread.
