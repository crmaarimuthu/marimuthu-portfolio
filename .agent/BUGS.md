# Known limitations / doc-vs-code drift

No open functional bugs identified during initial memory setup (2026-07-21) —
this file tracks limitations-by-design and documentation drift, not a live
issue tracker. Add real bugs here as they're found, with repro + file
reference.

## By-design limitations

- **Only 2 avatar meshes** (Renderpeople free tier) for player + all 10 NPCs
  — differentiated by clothing tint only, one baked animation clip each. See
  `docs/NPC_SYSTEM.md` "Avatar variation".
- **No physics engine** — collision is a bespoke circle-vs-AABB resolver,
  sufficient for a flat single floor; may need revisiting if terrain/vehicle
  physics gets more complex (see `docs/ADR_001_3D_ENGINE_SELECTION.md`).
- **Embedded IDE is 100% simulated** — by design, not a limitation to fix
  (this is a portfolio demo, not a real dev tool). Don't "improve" this into
  real compilation.

## Documentation drift

- `docs/ROADMAP.md` marks Milestone 9 (vehicles & traffic) as NOT STARTED,
  but `src/vehicles/`, `src/world/city/`, and `docs/CITY_WORLD.md` show it's
  already implemented (drivable vehicles, traffic, pedestrians, open city
  block). Same pattern occurred with the animation state machine being
  pulled forward during Milestone 3.
  - **Action if you touch this area**: consider updating `docs/ROADMAP.md`'s
    Milestone 9 entry to DONE (with a note on what's implemented vs. still
    missing, e.g. pedestrian density system specifics) rather than leaving it
    silently stale — but that's a docs/ edit, confirm with the user first
    since it's their milestone tracker.
- `STATUS.md`'s "249/249 tests" figure is from the README's Milestone 5
  snapshot; vehicle/city modules have their own test files
  (`vehiclePhysics.test.ts`, `cityLayout.test.ts`, `pathLoop.test.ts`) not
  reflected in that count. Run `npm run test` for the real number.
