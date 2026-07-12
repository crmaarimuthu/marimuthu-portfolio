# Privacy Review

This project is a public portfolio. This document tracks what is and is
not safe to expose, and how configuration enforces that boundary.

## Public-safe by design

- `config/profile.ts` — `mapLatitude`/`mapLongitude` are set to a
  **city-level, publicly known** coordinate (Coimbatore, Tamil Nadu city
  centroid), never an exact address or device GPS reading. No street
  address field exists in the schema.
- `config/workplace.ts` — company identity fields default to a fictional
  placeholder (`companyDisplayName: "TODO: confirm public company name"`)
  until explicitly supplied and approved by the user. No real office floor
  plan, internal network diagram, or proprietary source code is to be
  reproduced.
- NPCs (Milestone 5+) use fictional placeholder identities by default —
  no real coworker names, faces, or likenesses without explicit, separate
  approval.
- The avatar system (Milestone 2+) is a stylized/configurable character,
  not a biometric likeness, unless real reference assets are explicitly
  supplied and approved by the user.

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
  information is populated with a `TODO:` placeholder string rather than
  an invented value, per the brief's explicit instruction not to fabricate
  facts.
- Before any milestone adds NPC identities, employer names, or exact
  facility layouts, confirm with the user whether real reference material
  is being supplied and approved, or whether fictionalized placeholders
  should remain permanent.
