# Status

_Last synced: 2026-07-21 (later session), from repo state at commit `4f28622` (branch `main`) + uncommitted working tree changes described below._

## Quality gate

- `npm run lint` — **passing** (verified 2026-07-21, after installing Node.js
  v24.18.0/npm 11.16.0 via winget on this machine — it had none before).
- `npm run typecheck` — **passing**, same run.
- `npm run test` — **288/288 tests passing (38 suites)**, same run.
- `npm run build` (`next build`, Turbopack) — **passing**, both `/` and
  `/city` statically generated. Confirmed via the built HTML that the
  three.js/postprocessing chunk used by the new hero 3D scene is excluded
  from `/`'s initial script list (only loads once `Hero3D` actually mounts
  the canvas).
- **Not verified**: no real browser/Lighthouse run was possible in this
  environment (no headless Chrome / dev server check). The hero 3D scene,
  animations, and all new interactions are unverified visually — run
  `npm run dev` and eyeball it, and run Lighthouse before trusting the
  "95+" performance target from the original brief.

This section now reflects a real run, not a stale snapshot — but re-run
before trusting it for a deploy, per usual.

## Milestone status

DONE: 1, 3, 4, 5, plus vehicles/city-block (M9 scope) and portfolio content data layer (M6 data prep) ahead of schedule.
NOT STARTED: 2 (avatar/GLB), 6 (in-world content display), 7 (map/city-zone streaming), 8 (home/day-night), 10 (production hardening).
Full breakdown: [FEATURES.md](FEATURES.md).

## Recent activity (from git log + uncommitted work)

- (uncommitted) AAA cinematic 3D upgrade of `/`: real user identity/specialization
  content, Tailwind v4 + Framer Motion + GSAP/ScrollTrigger + Lenis + R3F
  hero scene with bloom, 8-category hex skill grid, GTA-style mission
  loading screen. See CHANGELOG for full detail.
- `updated 3d city` — city world / vehicle work
- `updated portfolio`
- Typed portfolio content data layer added (M6 prep)
- Mouse/touch look + camera-relative movement, key auto-repeat fix
- Real human avatars replacing capsule placeholders
- NPCs/navigation/teams/safety work (M5)
- Embedded simulation work (M4), Vercel deploy fix
- Office build-out (M3)

## Known drift

`docs/ROADMAP.md` hasn't been updated to reflect that vehicles/city (M9) and
real avatars are already implemented — see [BUGS.md](BUGS.md). Not a code
bug, just a documentation lag; flag it if you're about to make a milestone-
sequencing decision based on ROADMAP.md alone.
