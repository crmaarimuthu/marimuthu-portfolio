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

## Embedded simulation cost (Milestone 4)

See `docs/EMBEDDED_SIMULATION.md` and `docs/VIRTUAL_BOARD.md` for full
detail. Highlights:

- **No React state updates per animation frame**: the 3D LED
  (`EmbeddedBoard3D.tsx`) reads GPIO state via
  `useEmbeddedStore.getState()` inside `useFrame` — a direct read, not a
  subscribed hook — so a GPIO toggle only mutates a material property,
  never triggers a React re-render of the 3D tree. The board *status
  panel* (DOM, `BoardStatusPanel.tsx`) does use a subscribed hook, since
  DOM text genuinely needs to re-render on each toggle — but that's
  cheap (a small text diff), unlike a full R3F re-render.
- **No duplicate timers**: `VirtualFirmwareRuntime.start()` is a no-op
  if already running; every `useEmbeddedStore` action that starts a new
  build/flash/runtime first clears any prior timer/runtime instance.
- **No dynamic point light on the LED** — an emissive material change
  alone is enough at workstation viewing distance, avoiding a real-time
  light regardless of quality profile (see `docs/VIRTUAL_BOARD.md`).
- **No syntax-highlighting library dependency**: `cSyntaxHighlight.ts`
  is a ~40-line regex tokenizer instead of Prism/CodeMirror/Monaco,
  evaluated and rejected specifically on bundle-size grounds for a
  single fixed read-only file — see `docs/WORKSTATION_IDE.md` "Code
  viewer".
- **Visibility-aware runtime**: the blink timer is paused/resumed by
  the same Page Visibility listener that already toggles the R3F
  `frameloop` (`Scene.tsx`), so a backgrounded tab doesn't keep ticking.

## NPC population cost (Milestone 5)

See `docs/NPC_SYSTEM.md` "Density scaling & update budgets" for full
detail. Highlights:

- **Explicit density budgets, not open-ended spawning**: `useNpcStore
  .setActiveBudget(qualityLevel)` reuses `QUALITY_PROFILES[level]
  .npcBudget` (already defined since Milestone 1) — `LOW` spawns **zero**
  NPCs, `MEDIUM`/`HIGH`/`ULTRA` spawn progressively more of a fixed,
  small (10-NPC) roster. Nothing outside `activeNpcIds` is ticked or
  rendered.
- **Direct-read position binding**: `NPCInstance.tsx` reads its NPC's
  position/state from `useNpcStore.getState()` inside `useFrame` — the
  same direct-read pattern as `EmbeddedBoard3D`'s GPIO binding — so
  per-frame navigation movement never triggers a React re-render.
- **Cached NPC profile lookups**: `NPC_PROFILES` is loaded and validated
  once at module import time (`npcContent.ts`), not re-parsed from JSON
  per frame or per lookup.
- **No per-NPC dynamic lights**: NPCs are flat-shaded capsules with a
  role-tinted material and an optional emissive tint while `TALKING` —
  no light source is attached to any NPC.
- **One `tick()` call for the whole population**, not one `useFrame`
  subscription per NPC — `OfficeNpcPopulation.tsx` ticks
  `useNpcStore` once per frame; the store internally loops over
  `activeNpcIds`.

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
- `npcBudget` is implemented and in use (Milestone 5, see above);
  `trafficBudget` remains unused until vehicles/pedestrians exist
  (Milestone 9).
- NPC local avoidance / crowd separation — deferred, see
  `docs/NAVIGATION_SYSTEM.md` "Local avoidance".
- Web Workers for simulation — relevant once a simulation loop (EMS/BMS,
  Milestone 6+) exists that's heavy enough to justify moving off the
  main thread.
