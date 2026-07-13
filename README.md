# Marimuthu Rajagopal — Interactive Portfolio

A realistic, browser-based, third-person 3D open-world portfolio built with
Next.js + React Three Fiber. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for
the milestone plan; this repo currently implements **Milestones 1, 3, and 4**
(project foundation — responsive 3D canvas, capability detection, quality
profiles, third-person player capsule, desktop/mobile controls, camera
follow — a realistic IT/embedded office with a configurable player
workstation and a general interaction system — and an interactive,
explicitly-simulated embedded firmware workflow: browse trusted C17
source, run a deterministic build/flash simulation, start a virtual
embedded board, and watch a real 3D LED follow live virtual-GPIO state).
Milestone 2 (a real configurable avatar/GLB pipeline) has not been
implemented yet — the player is still a capsule placeholder; see
`docs/ROADMAP.md`.

## Documentation

- [`docs/ADR_001_3D_ENGINE_SELECTION.md`](docs/ADR_001_3D_ENGINE_SELECTION.md) — engine choice (React Three Fiber) and why
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module layout and system design
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — milestone plan and status
- [`docs/PLAYER_SYSTEM.md`](docs/PLAYER_SYSTEM.md) — locomotion, collision, config
- [`docs/ANIMATION_SYSTEM.md`](docs/ANIMATION_SYSTEM.md) — animation state machine
- [`docs/OFFICE_WORLD.md`](docs/OFFICE_WORLD.md) — office layout, doors, collision, camera
- [`docs/INTERACTION_SYSTEM.md`](docs/INTERACTION_SYSTEM.md) — target selection, chair/workstation flow
- [`docs/EMBEDDED_SIMULATION.md`](docs/EMBEDDED_SIMULATION.md) — firmware project, build/flash simulators, runtime, success/achievement (**read this for the simulation boundary — nothing here is real hardware/compilation**)
- [`docs/VIRTUAL_BOARD.md`](docs/VIRTUAL_BOARD.md) — virtual board/GPIO model and the 3D LED binding
- [`docs/WORKSTATION_IDE.md`](docs/WORKSTATION_IDE.md) — IDE layout, keyboard shortcuts, mobile tabs
- [`docs/MOBILE_CONTROLS.md`](docs/MOBILE_CONTROLS.md) — touch input / virtual joystick / context button architecture
- [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) — quality profiles, DPR capping, visibility handling, office instancing
- [`docs/ASSET_PIPELINE.md`](docs/ASSET_PIPELINE.md) — current (procedural-only) asset status
- [`docs/PRIVACY_REVIEW.md`](docs/PRIVACY_REVIEW.md) — what is and isn't safe to expose publicly

## Requirements

- Node.js 20+ (tested on Node 24)
- npm 10+ (tested on npm 11)

## Setup — Desktop / Codespaces / Linux / macOS / WSL

```bash
git clone <this-repo-url>
cd marimuthu-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Desktop controls:
WASD to move, Shift to run, mouse for camera (future milestone), E to
interact, F to sit/stand. Inside the workstation IDE: Ctrl/Cmd+B build,
F flash, R run board, Escape exit (see `docs/WORKSTATION_IDE.md`).

## Setup — Android via Termux (mobile development)

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts git
git clone <this-repo-url>
cd marimuthu-portfolio
npm install
npm run dev -- --hostname 0.0.0.0
```

Then open `http://localhost:3000` in a mobile browser on the same device,
or `http://<device-lan-ip>:3000` from another device on the same network.
On-screen touch controls (virtual joystick, run button, and a
context-sensitive interaction button) appear automatically on
mobile/tablet-classed viewports.

## Available scripts

```bash
npm run dev         # start the Next.js dev server (Turbopack)
npm run build        # production build
npm run start        # run the production build
npm run lint          # ESLint (Next.js + React rules)
npm run typecheck     # TypeScript --noEmit
npm run test          # Vitest unit tests (input, movement, animation state, quality logic)
```

## Verification status (Milestone 4)

- `npm run lint` — passing
- `npm run typecheck` — passing
- `npm run test` — 166/166 tests passing across 24 suites
- `npm run build` — passing (static export of `/`)

## Configuration

Public-safe, non-fabricated profile and workplace data lives in
[`src/config/profile.ts`](src/config/profile.ts) and
[`src/config/workplace.ts`](src/config/workplace.ts). Any field requiring
private information (exact address, real employer name, building label,
etc.) is left as a `TODO_USER_INPUT` placeholder rather than invented —
see [`docs/PRIVACY_REVIEW.md`](docs/PRIVACY_REVIEW.md). The office
*layout* itself (`src/world/office/officeLayout.ts`) is entirely
fictionalised — see [`docs/OFFICE_WORLD.md`](docs/OFFICE_WORLD.md).

## Embedded firmware demo

Sitting at the configured workstation and pressing **E — Use
Workstation** opens an in-world embedded IDE running a fully simulated
C firmware workflow (browse source → build → flash → run → watch a 3D
LED blink from live virtual-GPIO state → task-complete celebration).
**No real compiler, debug probe, or hardware is involved anywhere in
this flow** — see [`docs/EMBEDDED_SIMULATION.md`](docs/EMBEDDED_SIMULATION.md)
for the exact simulation boundary before assuming otherwise from the
UI's professional styling.

## Git workflow

- Work happens on feature branches; `main` stays deployable.
- Before committing: `npm run lint && npm run typecheck && npm run test && npm run build` must all pass.
- Commits are created only when explicitly requested; force-push and
  history rewriting on shared branches are avoided.
- `.gitignore` excludes `node_modules/`, `.next/`, `*.tsbuildinfo`, and
  any `.env*` file — never commit secrets or generated build output.

## Deployment preparation

This is a standard Next.js App Router project, so it deploys anywhere
Next.js does (e.g. `next build` + `next start`, or a platform with
native Next.js support). Before deploying:

1. Run the full quality gate above and confirm all four checks pass.
2. Confirm `src/config/workplace.ts` no longer contains placeholder
   `TODO:` values you don't intend to ship publicly (see
   `docs/PRIVACY_REVIEW.md`).
3. `npm run build && npm run start` locally to smoke-test the production
   build before pushing to a hosting provider.
