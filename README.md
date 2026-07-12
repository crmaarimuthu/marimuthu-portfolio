# Marimuthu Rajagopal — Interactive Portfolio

A realistic, browser-based, third-person 3D open-world portfolio built with
Next.js + React Three Fiber. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for
the milestone plan; this repo currently implements **Milestone 1**
(project foundation: responsive 3D canvas, capability detection, quality
profiles, basic environment, third-person player capsule, desktop and
mobile controls, camera follow).

## Documentation

- [`docs/ADR_001_3D_ENGINE_SELECTION.md`](docs/ADR_001_3D_ENGINE_SELECTION.md) — engine choice (React Three Fiber) and why
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module layout and system design
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — milestone plan and status
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
interact, F to sit/stand.

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
On-screen touch controls (virtual joystick, run/interact/sit buttons)
appear automatically on mobile/tablet-classed viewports.

## Available scripts

```bash
npm run dev         # start the Next.js dev server (Turbopack)
npm run build        # production build
npm run start        # run the production build
npm run lint          # ESLint (Next.js + React rules)
npm run typecheck     # TypeScript --noEmit
npm run test          # Vitest unit tests (input, movement, animation state, quality logic)
```

## Verification status (Milestone 1)

- `npm run lint` — passing
- `npm run typecheck` — passing
- `npm run test` — 21/21 tests passing across 4 suites
- `npm run build` — passing (static export of `/`)

## Configuration

Public-safe, non-fabricated profile and workplace data lives in
[`src/config/profile.ts`](src/config/profile.ts) and
[`src/config/workplace.ts`](src/config/workplace.ts). Any field requiring
private information (exact address, real employer name, etc.) is left as
a `TODO:` placeholder rather than invented — see
[`docs/PRIVACY_REVIEW.md`](docs/PRIVACY_REVIEW.md).
