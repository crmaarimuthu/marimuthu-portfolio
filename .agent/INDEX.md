# .agent/ — Project Memory Index

This folder is a **thin, always-current memory layer** for coding agents working
in this repo. It summarizes and links out to the real documentation in
[`../docs/`](../docs/) and [`../README.md`](../README.md) rather than duplicating it —
`docs/` remains the authoritative source for architecture and system design.

| File | Purpose |
|---|---|
| [PROJECT_MEMORY.md](PROJECT_MEMORY.md) | Top-level orientation: what this project is, stack, entry points |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module map + pointers into `docs/*_SYSTEM.md` |
| [FEATURES.md](FEATURES.md) | Completed vs. pending features (milestone summary) |
| [API.md](API.md) | API surface (none — static client-only app) |
| [DATABASE.md](DATABASE.md) | Persistence model (none — client state only) |
| [STATUS.md](STATUS.md) | Current build/test status, active milestone, last known-good commit |
| [TODO.md](TODO.md) | Outstanding work: unstarted milestones, `TODO_USER_INPUT` placeholders |
| [BUGS.md](BUGS.md) | Known limitations / doc-vs-code drift to watch for |
| [CHANGELOG.md](CHANGELOG.md) | Rolling log of notable changes made via agent sessions |

## How to use this memory (for agents)

- **New feature request** → read PROJECT_MEMORY.md + ARCHITECTURE.md, find the
  relevant module row, open only the linked `docs/*.md` file(s) and the
  source files under that module. Don't re-read the whole repo.
- **Bug report** → check BUGS.md first, then the relevant `docs/*_SYSTEM.md`.
- **After finishing work** → update STATUS.md, TODO.md/FEATURES.md if scope
  changed, append a line to CHANGELOG.md. Do not touch `docs/` unless the
  change actually alters that system's design (then update the specific
  `docs/*.md` file directly — that's still the source of truth).
- Full quality gate before considering work done: `npm run lint && npm run
  typecheck && npm run test && npm run build` (see README.md "Git workflow").
