# Features

Full detail: [`../docs/ROADMAP.md`](../docs/ROADMAP.md) (milestone plan, status legend DONE/IN PROGRESS/NOT STARTED).
⚠️ See [BUGS.md](BUGS.md) — the roadmap doc lags actual code in a couple of places (noted below).

## Completed

- **M1 — Foundation**: responsive 3D canvas, capability detection, quality
  profiles, third-person player, desktop/mobile controls, camera follow.
- **M3 — Office, interior, workstation, interactions**: 10-room office,
  door state machine, AABB wall collision, proximity+facing interaction
  system, sit/stand chair flow, workstation mode.
- **M4 — Embedded firmware workstation**: full simulated C build → flash →
  run → 3D LED → success/celebration flow, achievement persistence, Reset
  Demo. Nothing here is a real compiler/hardware — see
  `docs/EMBEDDED_SIMULATION.md`.
- **M5 — NPCs, teams, navigation, schedules, dialogue**: fictional 10-NPC
  roster, 12-state NPC state machine, 5 teams, zone-graph BFS navigation,
  role-aware schedules, offline structured dialogue (8 role files),
  quality-driven NPC density scaling.
- **Ahead of schedule / not yet reflected in ROADMAP.md**: real human avatar
  meshes (Renderpeople free tier, 2 variants) replacing capsule
  placeholders; drivable vehicles + traffic + pedestrians + open city block
  (`docs/CITY_WORLD.md`) — this is Milestone 9 scope, already implemented.
  Milestone 6 content *data layer* (typed skills/projects/experience schema)
  also built early, no display surface yet.

## Not started

- **M2 — Avatar & animation**: configurable GLB/GLTF avatar integration
  layer, full skinned clips, camera orbit/collision improvements. (The
  animation *state machine* itself was extended ahead of schedule for
  sit/stand — see `docs/ANIMATION_SYSTEM.md`.)
- **M6 — Portfolio content display**: in-world display surface for
  self-intro/skills/projects/EMS-BMS presentation. Data layer exists;
  most project/experience content is still `TODO_USER_INPUT` (see
  [TODO.md](TODO.md)).
- **M7 — India map & city zone**: cinematic map, location transition, city
  zone streaming.
- **M8 — Home & day/night**: home, sleep flow, world clock tied to NPC
  schedules (a simulated clock already exists for schedules —
  `docs/NPC_SCHEDULES.md` — but no day/night visuals or home yet).
- **M10 — Production hardening**: optimization, accessibility, fallback
  polish, mobile testing, deployment.

Each milestone must pass lint + typecheck + test + build before starting the next (see README.md "Git workflow").
