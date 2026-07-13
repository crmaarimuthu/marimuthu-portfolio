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
being a variable in performance testing. It remains alongside the
office in Milestone 3 (the office sits further into the scene, at
`z < -14`) as the original outdoor spawn baseline.

## Office rendering cost (Milestone 3)

See `docs/OFFICE_WORLD.md` "Performance" for full detail. Highlights:

- **Instancing**: every office wall segment renders through one
  `<Instances>` mesh (`OfficeStructure.tsx`) — the office has dozens of
  wall segments but costs one draw call. Engineering/team-lead desks
  render through `DeskCluster.tsx`'s five instanced meshes
  (surface/frame/monitor/screen/chair) regardless of desk count.
- **Shared materials**: `OfficeMaterials.tsx` allocates ~16 materials
  once and reuses them across every wall, desk, door, and prop in the
  office — no per-mesh material allocation.
- **Collision is O(walls) per frame, not O(triangles)**: the simplified
  circle-vs-AABB resolver (`world/office/collision.ts`) tests the player
  against a static, precomputed wall-box list rather than raycasting
  against real geometry.
- **Quality-gated detail**: `environmentDetail === "LOW"` skips the
  second embedded-lab bench; shadows are still globally gated by the
  Canvas's `shadows` prop from Milestone 1 (`profile.shadows`), so
  `castShadow`/`receiveShadow` flags throughout the office become no-ops
  at LOW/MEDIUM without per-mesh branching.
- **Zone tracking is O(zones) per frame, not per-frame allocation**:
  `resolveOfficeZone` iterates a small fixed array of rectangles; no
  object allocation happens unless the zone actually changes.

## Deferred, architected-for-but-not-yet-built

Per the brief, these are **not** implemented yet, but the current
module boundaries (`engine/`, `world/`, `player/` as separate concerns)
are chosen so they can be added without restructuring:

- LOD, texture compression (KTX2/Basis), Draco/Meshopt — relevant once
  real GLB assets exist (deferred "Milestone 2" avatar scope, or a
  future office asset upgrade). See `docs/ASSET_PIPELINE.md`.
- True camera-vs-wall collision (currently just an indoor distance
  reduction, see `docs/OFFICE_WORLD.md`).
- World zones / asset streaming — relevant once the city exists
  (Milestone 7+).
- NPC/traffic density scaling against `npcBudget`/`trafficBudget` —
  relevant once NPCs/vehicles exist (Milestones 5, 9).
- Web Workers for simulation — relevant once a simulation loop (EMS/BMS,
  Milestone 6+) exists that's heavy enough to justify moving off the
  main thread.
