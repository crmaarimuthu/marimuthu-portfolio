# TODO

## Unstarted milestones (see docs/ROADMAP.md)

- M2 — configurable avatar/GLB integration layer, full skinned animation clips, camera orbit/collision improvements
- M6 — in-world display surface for portfolio content (data layer already exists, see `docs/PORTFOLIO_CONTENT.md`)
- M7 — India map & city zone streaming
- M8 — home, sleep flow, day/night tied to NPC schedules
- M10 — production hardening (optimization, accessibility, mobile testing, deployment polish)

## Content placeholders

`src/config/workplace.ts` still has `TODO_USER_INPUT` markers for private
employer information intentionally left unfabricated (real employer name,
exact address, building label, etc.) — see `docs/PRIVACY_REVIEW.md`.
`src/config/profile.ts`/`site.ts` are now filled with the user's real
supplied identity (name, title, LinkedIn/GitHub, tagline/about reflecting
their actual specialization list — 2026-07-21 session).

`src/content/portfolio/projects.ts` — the 8 entries now have **real
titles** (user-confirmed project domains: BMS, EMS, BESS, SCADA Platform,
CAN Analyzer, Modbus Gateway, Embedded Linux Gateway, Industrial IoT
Gateway) but summary/responsibilities/technologies/outcome/links are still
`TODO_USER_INPUT`/empty — status `"details-pending"`, rendered in the UI as
an honest "write-up coming soon" state. Ask the user for the real specifics
per project before calling this milestone done; do not invent them.
`src/content/portfolio/experience.ts` is still fully `TODO_USER_INPUT`
(no real employer/timeline supplied yet).

**Before any public deploy**: confirm no unintended `TODO:` placeholder
values ship (README "Deployment preparation" step 2).
