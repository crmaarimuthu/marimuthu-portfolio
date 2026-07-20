# TODO

## Unstarted milestones (see docs/ROADMAP.md)

- M2 — configurable avatar/GLB integration layer, full skinned animation clips, camera orbit/collision improvements
- M6 — in-world display surface for portfolio content (data layer already exists, see `docs/PORTFOLIO_CONTENT.md`)
- M7 — India map & city zone streaming
- M8 — home, sleep flow, day/night tied to NPC schedules
- M10 — production hardening (optimization, accessibility, mobile testing, deployment polish)

## Content placeholders

`src/config/workplace.ts` and `src/config/profile.ts` contain
`TODO_USER_INPUT` markers for private information intentionally left
unfabricated (real employer name, exact address, building label, etc.) —
see `docs/PRIVACY_REVIEW.md`. Most Milestone 6 project/experience content
(`src/content/portfolio/*.ts`) is also still `TODO_USER_INPUT` pending real
input from the user.

**Before any public deploy**: confirm no unintended `TODO:` placeholder
values ship (README "Deployment preparation" step 2).
