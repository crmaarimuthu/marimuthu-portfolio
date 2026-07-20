# Changelog (agent-session memory log)

Rolling log of notable changes made across coding-agent sessions. Not a
replacement for `git log` — this is for the *why*/context behind changes that
git history alone won't show. Append newest entry at the top.

## 2026-07-21 (AAA 3D pass, same day as the CSS-only cinematic pass below)

Follow-up session, same day: the user gave real identity/specialization
info (name "C.R. Maari (Marimuthu)", title "Senior Embedded Firmware
Engineer", LinkedIn, and a detailed real tech list — Python, Modern C++,
BMS/BESS/EMS, SCADA, CAN FD, IEC 61850/60870-5-104, Embedded Linux,
Raspberry Pi) and explicitly asked for the full cinematic tech stack
(Tailwind, Framer Motion, GSAP, Three.js/R3F, Lenis) on `/`, superseding
the previous session's "stay dependency-free" call.

- **Environment fix**: this machine had no Node.js/npm at all (see the
  previous CHANGELOG entry's caveat) — installed Node.js v24.18.0 LTS via
  `winget` so the toolchain could actually be run and verified this time.
- **Real content** (`src/config/profile.ts`, `site.ts`,
  `src/content/portfolio/{techStack,projects}.ts`,
  `src/portfolio/portfolioTypes.ts`): name/title/LinkedIn now real;
  `PortfolioCategory` expanded from 4 to 8 (`embedded`, `communication`,
  `energy-systems`, `programming`, `tools`, `linux-tooling`, `cloud`,
  `scada`) to match the user's actual specialization breadth; `TECH_STACK`
  repopulated with their real supplied items only (nothing invented).
  `ProjectEntry` gained optional `githubUrl`/`liveUrl`/`architectureUrl`/
  `docsUrl` fields (all unset — no real links exist yet) and a new
  `"details-pending"` status. **Decision, confirmed with the user via
  AskUserQuestion** (docs/PRIVACY_REVIEW.md bars inventing project
  outcomes): the 8 project titles the user named (BMS, EMS, BESS, SCADA
  Platform, CAN Analyzer, Modbus Gateway, Embedded Linux Gateway,
  Industrial IoT Gateway) are now real titled cards, but
  summary/responsibilities/technologies/outcome stay `TODO_USER_INPUT`
  until the user supplies specifics — see TODO.md.
- **New dependencies**: `tailwindcss` + `@tailwindcss/postcss` v4
  (zero-config, `@import "tailwindcss"` in globals.css + `postcss.config.mjs`),
  `framer-motion`, `gsap`, `lenis`, `@react-three/postprocessing`.
  Deliberately did **not** add Spline (this project's architecture is
  explicitly "no backend, no external API calls" — Spline scenes fetch
  from Spline's CDN at runtime, which would break that invariant) or Lottie
  (no real Lottie asset exists; a fake one would be exactly the kind of
  placeholder this project's content policy forbids). "Motion One" wasn't
  installed separately either — framer-motion already covers that surface;
  running both would just be two overlapping animation engines.
- **Hero 3D scene** (`src/ui/portfolio/hero3d/`): procedural PCB board
  with circuit traces, floating MCU/CAN/BMS chip meshes (drei `Float`),
  two CAN-bus packets with light trails (drei `Trail`) flowing around the
  board on closed Catmull-Rom loops, an animated oscilloscope waveform
  (hand-rolled per-frame `Line2.geometry.setPositions`, the one bit of
  custom per-frame geometry mutation — everything else leans on drei's
  tested helpers), electron sparkle fields (drei `Sparkles`), dual
  blue/orange rim lighting, and bloom via
  `@react-three/postprocessing`. **Hydration-safe by construction**: `/`
  is server-rendered (unlike `/city`, which is never SSR'd), so `Hero3D`
  renders the existing SVG circuit fallback on both the server and the
  first client render, then swaps to the `next/dynamic(ssr:false)`-loaded
  canvas in a post-mount effect once `detectCapability()` (the same probe
  `/city` uses) confirms WebGL2 and no reduced-motion — verified via the
  built HTML that the ~800KB+ three.js/postprocessing chunk is excluded
  from `/`'s initial script list.
- **Motion stack wiring**: `useLenis.ts` (Lenis smooth scroll, no-ops
  under reduced motion, native `scroll-behavior` set to `auto` in
  globals.css so the two never fight); all section/card reveals migrated
  from the previous session's hand-rolled `useReveal`
  IntersectionObserver hook to Framer Motion (`whileInView` + shared
  `fadeUp` variants, collapsing to ~0 duration under
  `useReducedMotion()`); GSAP + ScrollTrigger for real derived-data stat
  count-ups (Technologies/Protocols/Project Domains/Skill Categories —
  actual counts from `TECH_STACK`/`PROJECTS`, nothing invented) and a
  scroll-scrubbed "mission progress" fill line on the Experience timeline.
- **Skills section rebuilt** as 8 animated hex-clip-path category cards
  (one per `PortfolioCategory`, counts derived from `TECH_STACK`) with
  hover tilt/glow and a dependency-free DOM particle burst (spawned into
  `document.body` with fixed positioning, since the hex `clip-path` would
  otherwise clip particles spawned as children).
- **Loading screen** (`src/ui/LoadingScreen.tsx`, used by `/city`'s
  Suspense boundary) rebuilt as a GTA "mission loading" screen: fake
  perceived-progress bar + rotating flavor-text tips — all tips describe
  real, already-implemented mechanics of this world (the embedded
  workstation, NPC dialogue, drivable vehicles), nothing fabricated.
- **Fixed two React Compiler lint errors** (`react-hooks/set-state-in-effect`,
  `react-hooks/purity`) surfaced by this new code — see
  `useDeviceClass.ts`'s existing check()-function convention, which this
  code now mirrors for the same "detect once client-side, setState"
  pattern; also removed a stray `Math.random()` render-time call.
- **Quality gate**: `npm run lint`/`typecheck` clean, `npm run test`
  288/288 passing, `npm run build` succeeds for both routes. **Not**
  verified: no real-browser or Lighthouse run was possible in this
  environment — see STATUS.md.

## 2026-07-21 (CSS-only cinematic pass, earlier same day)

- Cinematic UI/UX pass on the 2D landing page (`/`, `src/ui/portfolio/`):
  dark-premium theme with electric-blue + circuit-orange dual lighting,
  glassmorphism cards, animated gradient/grid background, scroll-reveal
  (IntersectionObserver), cursor spotlight, tilt/glow project cards, hex-style
  skill cards, mission-style experience timeline, scroll progress bar, and a
  decorative inline-SVG "PCB" hero motif. **Deliberately dependency-free**
  (no Tailwind/Framer Motion/GSAP/Lenis added) — all motion is
  transform/opacity CSS + small rAF-throttled listeners, gated behind
  `prefers-reduced-motion`, to keep bundle size and the existing plain-CSS
  approach intact per `.agent/ARCHITECTURE.md`'s "reuse existing" guidance.
  The `/city` R3F world was intentionally left untouched — it already is
  the cinematic 3D experience; this pass only upgrades the flat landing page.
  `PortfolioPage.tsx` is now a client component (`"use client"`) because of
  the scroll/pointer listeners; all content still comes from
  `src/content/portfolio/*` — no copy or data changed.
  Also refreshed `LoadingScreen.tsx`, `PortfolioFallback.tsx` colors and
  `layout.tsx` metadata/OG tags to match the new palette.
  **Not verified against the project's quality gate** (`npm run lint &&
  typecheck && test && build`) — this machine has no Node.js/npm installed,
  only reviewed manually. Run the gate before relying on this for a deploy.

## 2026-07-21

- Initialized `.agent/` project memory system (this folder): PROJECT_MEMORY,
  ARCHITECTURE, FEATURES, API, DATABASE, STATUS, TODO, BUGS, INDEX,
  CHANGELOG. Kept intentionally thin — `docs/` (20 files) remains the
  authoritative source for architecture/system design per user decision to
  avoid duplicating existing documentation.
- No code changes made this session.
