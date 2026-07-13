# Portfolio Content Architecture

## Attribution and scope

At the user's request, this content architecture's *pattern* — "every
piece of copy lives in a typed data file, never hardcoded inside a UI
component" — was reviewed from
https://github.com/prabhagaran/portfolio for inspiration. That repo
carries no license (default all-rights-reserved), so **no code, design
tokens, or personal content were copied from it** — only the general
idea of categorised, data-driven content files, which is a common,
unprotectable architectural pattern (also already used in this
project's `content/npcs.json`/`content/teams.json`/`content/dialogue/*.json`
since Milestone 5). Every fact in the files below is either information
the user has already supplied elsewhere in this project (name,
professional title, the specific tech/skill categories listed in the
original project brief) or an explicit `TODO_USER_INPUT` placeholder —
never content borrowed from that reference repo or invented outright.
See `docs/PRIVACY_REVIEW.md`.

## Status

This is the **content layer only** — typed data files and validation,
no new in-world UI surface. Displaying this content inside the 3D
world (e.g. a skills board in the embedded lab, a projects panel) is
Milestone 6 ("Portfolio content integration, full character
self-introduction...") per `docs/ROADMAP.md`, which remains **not
started**. This work exists so that milestone can consume ready-made,
validated data rather than starting from nothing.

## Schema

`src/portfolio/portfolioTypes.ts`:

```ts
type PortfolioCategory = "embedded" | "communication" | "energy-systems" | "linux-tooling";

interface TechStackItem { id: string; name: string; category: PortfolioCategory; }
interface SkillEntry { id: string; name: string; category: PortfolioCategory; description: string; }
interface ProjectEntry { id: string; title: string; category: PortfolioCategory | "generic"; summary: string; responsibilities: string; technologies: string[]; outcome: string; status: ProjectStatus; }
interface ExperienceEntry { id: string; organization: string; title: string; startDate: string; endDate: string; summary: string; }
interface CertificationEntry { id: string; name: string; issuer: string; issuedDate: string; }
```

`isPlaceholder(value)` checks for the `"TODO_USER_INPUT"` sentinel
string used throughout this project (see `docs/PRIVACY_REVIEW.md`)
rather than an invented value. `validateTechStack`/`validateProjects`
catch duplicate ids and missing required fields as `ERROR` diagnostics
(never thrown — same non-crashing validation pattern as
`characters/npc/NPCProfile.ts`); a placeholder title is only a
`WARNING`, since placeholders are expected and honest, not a defect.

## Content files

`src/content/portfolio/`:

| File | Status | Source of the data |
|---|---|---|
| `techStack.ts` | **Populated** (26 items) | The exact tech/skill categories the user specified in the original project brief's "Professional Portfolio Integration" section (embedded/communication/energy-systems/Linux groupings) — real user-supplied information. |
| `skills.ts` | Categories populated, descriptions `TODO_USER_INPUT` | Same categories as above; depth/experience descriptions aren't known yet, so each is an explicit placeholder rather than an invented proficiency claim. |
| `projects.ts` | **All placeholder** | No real project titles/responsibilities/outcomes have been supplied. Three placeholder slots (one per domain: embedded, communication, energy-systems) establish the shape. |
| `experience.ts` | **All placeholder** | No real employer/career-timeline detail has been supplied. |
| `certifications.ts` | **Empty array** | Deliberately empty rather than a placeholder entry — an empty list reads honestly as "none listed yet," whereas a placeholder certification could look like a real one at a glance. |

## Loader

`src/portfolio/portfolioContent.ts` re-exports every content file's
data plus `PORTFOLIO_CONTENT_DIAGNOSTICS` (validation run once at
import time, matching `characters/npc/npcContent.ts`'s pattern) and a
`getTechStackByCategory(category)` helper.

## Filling in real content later

When the user supplies real project/experience/certification detail,
edit the corresponding file in `src/content/portfolio/` directly —
replace `"TODO_USER_INPUT"` values with real, approved text. No
component changes are needed; every consumer (once Milestone 6 builds
one) reads from `portfolioContent.ts`, not from hardcoded strings.
