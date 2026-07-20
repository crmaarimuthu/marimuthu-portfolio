# Status

_Last synced: 2026-07-21, from repo state at commit `4f28622` (branch `main`, clean working tree)._

## Quality gate (per README, as of last recorded run)

- `npm run lint` — passing (as of last recorded run; NOT re-verified after the
  2026-07-21 landing-page cinematic UI pass — see CHANGELOG — because this
  machine currently has no Node.js/npm installed. Run the full gate before
  trusting it.)
- `npm run typecheck` — same caveat as above
- `npm run test` — 249/249 tests passing (33 suites) *as of Milestone 5* — vehicle/city code has tests too (`vehiclePhysics.test.ts`, `cityLayout.test.ts`, `pathLoop.test.ts`) so actual current count is higher; re-run `npm run test` for the live number rather than trusting this file.
- `npm run build` — passing (static export of `/`) as of last recorded run; same not-re-verified caveat.

Re-verify all four before trusting this section for anything load-bearing (e.g. before a deploy) — this is a memory snapshot, not a live CI status.

## Milestone status

DONE: 1, 3, 4, 5, plus vehicles/city-block (M9 scope) and portfolio content data layer (M6 data prep) ahead of schedule.
NOT STARTED: 2 (avatar/GLB), 6 (in-world content display), 7 (map/city-zone streaming), 8 (home/day-night), 10 (production hardening).
Full breakdown: [FEATURES.md](FEATURES.md).

## Recent activity (from git log)

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
