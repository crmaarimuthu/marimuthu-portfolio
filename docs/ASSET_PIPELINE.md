# Asset Pipeline

## Current status (Milestone 3)

Every visible asset in the project — office structure, furniture,
embedded lab equipment, signage, the player capsule — is **procedural
geometry** (Three.js primitives: box/plane/cylinder/sphere) with a small
shared set of `MeshStandardMaterial`s (`src/world/office/OfficeMaterials.tsx`).
No `.glb`/`.gltf`/`.fbx` model files, no external textures, and no
third-party assets have been downloaded or embedded.

This means:
- There is nothing to attribute yet (no third-party asset licence
  tracking table is needed until real models are introduced).
- No Draco/Meshopt/KTX2 pipeline is wired up yet — there's nothing to
  compress. `@react-three/drei`'s `useGLTF` (with Draco/Meshopt support)
  is the intended loader once real GLB assets exist; see
  `docs/ADR_001_3D_ENGINE_SELECTION.md`.
- Room labels use SDF vector text (`drei`'s `<Text>`, backed by
  troika-three-text) rather than baked textures.

## When real assets are introduced (future milestones)

Track, per asset:

| Field | Description |
|---|---|
| Asset name | Descriptive name used in code/comments |
| Source | Where it was obtained (must be a licence-verified source) |
| Licence | Exact licence (e.g. CC0, CC-BY 4.0, a paid asset's EULA) |
| Modification | Whether/how the asset was altered from its original form |

Rules (per the project brief, section 29):
- Never download or embed a copyrighted/trademarked 3D asset without
  verifying its licence permits this use (including commercial/public
  portfolio use).
- Do not reproduce real, trademarked hardware geometry (e.g. a specific
  oscilloscope or MCU board's exact likeness) — the embedded lab props
  in this repo are intentionally generic/representative, not replicas.
- Prefer clean procedural/blockout geometry over an unverified "looks
  realistic" download. Architecture and gameplay correctness matter more
  than premature visual fidelity — this repo's approach throughout
  Milestones 1–3.

This document will gain an attribution table the moment any third-party
asset is added; until then, "procedural, no attribution needed" is the
accurate status.
