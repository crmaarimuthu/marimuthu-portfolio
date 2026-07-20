# Changelog (agent-session memory log)

Rolling log of notable changes made across coding-agent sessions. Not a
replacement for `git log` — this is for the *why*/context behind changes that
git history alone won't show. Append newest entry at the top.

## 2026-07-21 (later session)

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
