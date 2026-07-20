# Database

**No database.** All state is either:

- **In-memory / React**: Zustand stores (`src/state/*`) — quality profile,
  office/door/chair state, embedded firmware task state, NPC runtime state.
  Reset on page reload. See [ARCHITECTURE.md](ARCHITECTURE.md) "State stores".
- **Static content files**: `src/content/*.json` and `src/content/portfolio/*.ts`
  (NPCs, teams, dialogue trees, skills/projects/experience) — checked into
  the repo, not runtime-editable.
- **`localStorage`**: the only persisted state — quality-profile override
  (`persistQualityOverride`/`readPersistedQualityOverride`, see
  `docs/PERFORMANCE.md`) and the embedded-firmware achievement flag (see
  `docs/EMBEDDED_SIMULATION.md`).

If a real database is introduced later, replace this file with schema +
migration notes and link the relevant `docs/*.md`.
