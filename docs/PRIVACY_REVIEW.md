# Privacy Review

This project is a public portfolio. This document tracks what is and is
not safe to expose, and how configuration enforces that boundary.

## Public-safe by design

- `config/profile.ts` — `mapLatitude`/`mapLongitude` are set to a
  **city-level, publicly known** coordinate (Coimbatore, Tamil Nadu city
  centroid), never an exact address or device GPS reading. No street
  address field exists in the schema.
- `config/workplace.ts` — company identity fields default to a
  `TODO_USER_INPUT` placeholder until explicitly supplied and approved
  by the user. No real office floor plan, internal network diagram, or
  proprietary source code is to be reproduced.
- `world/office/officeLayout.ts` (Milestone 3) — the entire office room
  layout (lobby, engineering, embedded lab, meeting, executive, HR,
  manager, team-lead, pantry) is an invented, generic professional
  IT/embedded office. It was not derived from, and does not reproduce,
  any real employer's floor plan — see `docs/OFFICE_WORLD.md`.
- `content/npcs.json` (Milestone 5, implemented) — every NPC identity is
  fictional (invented names, e.g. "Priya," "Arun," "Divya"), attached to
  invented roles/teams. None reference, resemble, or were derived from
  real colleagues, real employee IDs, or confidential organisational
  data. Real identities may only be introduced through explicit
  user-supplied configuration — see `docs/NPC_SYSTEM.md` "Fictional
  identity policy".
- `content/dialogue/*.json` (Milestone 5) — all dialogue content is
  invented, portfolio-safe general text. Nothing claims to be an actual
  employer statement; the CEO profile's "vision" topic is explicitly a
  `TODO_USER_INPUT` placeholder rather than a fabricated company vision
  statement.
- **Player/NPC 3D likeness**: the player and every NPC now render as a
  licensed, commercially-usable human model from Renderpeople's free
  tier (see `docs/ASSET_PIPELINE.md` "Renderpeople asset attribution").
  These *are* real photoscanned human likenesses — but of paid,
  consenting stock-asset models licensed by Renderpeople for exactly
  this kind of real-time/commercial use, **not** of the portfolio
  owner, any real coworker, or anyone connected to this project. No
  attempt was made to depict a specific real, identifiable person tied
  to this portfolio. Only two distinct models are available at the
  free tier — every NPC reuses one of the two, differentiated only by
  a clothing tint (see `docs/NPC_SYSTEM.md` "Avatar variation"). The
  avatar system remains architecturally ready to swap in a different
  licensed model or a stylised/non-photoreal character if that's
  preferred later.

## Never to be committed to this repo or exposed client-side

- Exact home address or precise personal GPS coordinates.
- Personal phone number.
- Confidential employer data, internal org charts, or real employee PII.
- Proprietary/employer source code or internal documentation.
- Customer data of any kind.
- Internal IP addresses, hostnames, or network topology.
- Credentials, API keys, or secrets (enforced via `.env*` in `.gitignore`;
  no secrets are to be hardcoded in `config/` or `content/`).

## Process

- Any field in `config/` or `content/` that would require private
  information is populated with a `TODO_USER_INPUT` placeholder string
  rather than an invented value, per the brief's explicit instruction
  not to fabricate facts.
- NPC identities (now implemented, Milestone 5) and employer names/exact
  facility layouts remain fictionalized placeholders by default; before
  replacing any of them with real reference material, confirm with the
  user that it has been explicitly supplied and approved.
