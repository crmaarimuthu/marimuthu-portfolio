# Roadmap

Status legend: DONE / IN PROGRESS / NOT STARTED

- **Milestone 1 — Foundation** (DONE): project setup, engine ADR,
  responsive 3D canvas, capability detection, LOW/MEDIUM/HIGH/ULTRA quality
  profiles, basic test environment, third-person player capsule, desktop +
  mobile controls, camera follow, loading screen, 2D fallback shell, tests.
- **Milestone 2 — Avatar & animation** (NOT STARTED): configurable avatar
  integration layer (GLB/GLTF), full skinned animation clips, camera
  orbit/collision improvements. Not implemented in this repo yet — the
  animation *state machine* itself was extended ahead of schedule in
  Milestone 3 (SIT_DOWN/SITTING/STAND_UP) because the office chair system
  needed it; see docs/ANIMATION_SYSTEM.md.
- **Milestone 3 — Realistic IT office, interior, workstation & physical
  interactions** (DONE): office exterior/interior (10 areas: lobby,
  engineering, embedded lab, meeting, executive/CEO, HR, manager,
  team-lead, pantry, plus the entrance), reusable door state machine,
  simplified AABB wall collision, general interaction system (proximity +
  facing selection), configurable player workstation with sit/stand chair
  flow and workstation-mode preparation, indoor camera adjustment, office
  zone tracking, mobile context-sensitive interaction button. See
  docs/OFFICE_WORLD.md and docs/INTERACTION_SYSTEM.md. Does **not**
  include the embedded firmware build/flash/LED simulation (Milestone 4)
  or a real avatar (deferred Milestone 2 scope).
- **Milestone 4 — Interactive embedded firmware workstation** (DONE):
  trusted C17 demo project ("Virtual GPIO LED Blink") with a lightweight
  in-house syntax-highlighted code viewer; deterministic build simulator
  (staged validation/compile/link, diagnostics, deterministic
  demo-configured failure mode); virtual firmware image with a
  deterministic checksum; deterministic flash simulator (staged connect/
  erase/program/verify); a pure virtual board + GPIO reducer; a timer-
  driven firmware runtime that blinks the configured GPIO pin; a 3D LED
  on the workstation's embedded board that reads GPIO state directly
  every frame (no independent animation); a success evaluator requiring
  observed HIGH *and* LOW before declaring success; a celebration flow
  integrated with the player animation state machine
  (TYPE/DEBUG/INSPECT_BOARD/CELEBRATE); a persisted portfolio
  achievement; and a full Reset Demo flow. See docs/EMBEDDED_SIMULATION.md,
  docs/VIRTUAL_BOARD.md, docs/WORKSTATION_IDE.md. Explicitly simulated —
  no real compiler, debug probe, or hardware is involved at any point
  (docs/EMBEDDED_SIMULATION.md "Simulation boundary").
- **Milestone 5 — NPCs** (NOT STARTED): NPC architecture, navigation,
  schedules, dialogue.
- **Milestone 6 — Portfolio content** (NOT STARTED): self-introduction,
  skills, projects, EMS/BMS presentation, all config-driven.
- **Milestone 7 — India map & city zone** (NOT STARTED): cinematic map,
  location transition, city zone streaming.
- **Milestone 8 — Home & day/night** (NOT STARTED): home, sleep flow,
  world clock, NPC schedules tied to time.
- **Milestone 9 — Vehicles & traffic** (NOT STARTED): vehicle prototype,
  traffic prototype, pedestrian density system.
- **Milestone 10 — Production hardening** (NOT STARTED): optimization,
  accessibility, fallback portfolio polish, mobile testing, deployment.

Each milestone must pass lint, typecheck, unit tests, and production build
before the next milestone begins.
