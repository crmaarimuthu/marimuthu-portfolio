# Asset Pipeline

## Current status

Office structure, furniture, and embedded lab equipment remain
**procedural geometry** (Three.js primitives) with a small shared set
of `MeshStandardMaterial`s (`src/world/office/OfficeMaterials.tsx`) —
no third-party assets there.

The player and every NPC, however, now use **real third-party human
models** (see "Renderpeople asset attribution" below) — the first
non-procedural assets in this project.

## Renderpeople asset attribution

| Field | Value |
|---|---|
| Asset names | "Nathan" (`rp_nathan_animated_003_walking`), "Sophia" (`rp_sophia_animated_003_idling`) |
| Source | https://renderpeople.com/free-3d-people/ (free tier, FBX format) |
| Licence | Renderpeople General Terms & Conditions — free-tier models are "subject to the same terms of use as the charged models," which explicitly permit "real-time rendering for commercial or private use, such as for AR, VR, and XR applications as well as computer and video games." No attribution requirement is stated for this use. |
| Modification | Diffuse texture re-encoded/downscaled (see "Texture downscaling" below); geometry and animation clips are otherwise as shipped by Renderpeople. |
| Files | `public/models/people/{nathan,sophia}/{model.fbx,diffuse.jpg}` |

**Why only two people, not ten distinct NPCs:** the free tier is a
small sample pack, not a full character library — it ships exactly one
usable animated clip per character (a handful of distinct people total
across "posed"/"rigged"/"animated" categories, most with no baked
animation at all). Only Nathan (walking) and Sophia (idling) were
usable without an animation-retargeting/mocap pipeline this project
doesn't have. Every player/NPC instance is one of these two models;
individual NPCs are differentiated by a deterministic per-NPC clothing
tint (`pickTintColor`, seeded on NPC id) rather than being unique
scans — see `docs/NPC_SYSTEM.md` "Avatar variation".

**License consideration — client-side asset delivery:** Renderpeople's
terms also state 3D data must be protected "according to the current
state of technology" against easy third-party extraction, and flag
SaaS-style "third party access" as needing separate licensing (with an
explicit exception for computer games). Like any real-time
WebGL/glTF/FBX asset shipped in a browser game, this project's models
are downloadable via browser devtools by a technically motivated
visitor — the same is true of every asset in every browser-based 3D
game or Renderpeople-licensed real-time application; no client-side
web delivery mechanism can prevent this. This project relies on the
license's explicit "computer games" carve-out (an interactive,
real-time, playable 3D experience) rather than attempting DRM. If this
becomes a concern, the mitigating options are: purchasing a
commercial-tier license with clearer terms, or reverting the affected
character to the procedural capsule placeholder.

## Texture downscaling

Renderpeople's shipped diffuse textures are extremely high-resolution
(originals ~8K, tens of MB each as JPEG) — unsuitable for a mobile-first
target. Each character's diffuse texture was downscaled to 1024×1024
(quality 82 JPEG) using `sharp` (already present in this repo's
dependency tree as a transitive dependency of Next.js's image
optimizer, not a newly-added tool) as a one-off asset-preparation step,
bringing each texture down to ~150KB. Normal/gloss/mask maps shipped by
Renderpeople were **not** included at all — `PersonAvatar.tsx` uses a
single diffuse-mapped `MeshStandardMaterial`, trading some surface
detail for a much smaller payload; see docs/PERFORMANCE.md.

**Not yet done (documented limitation):** the FBX geometry itself was
not decimated/optimized, and no FBX→glTF (Draco/Meshopt) conversion was
performed — the project's development environment has no Blender/FBX
conversion tool available, and installing one is a decision left to
the user (a permission gate is already in place for adding new
third-party tools). Each model is currently ~10–25MB as raw FBX,
loaded once via `@react-three/drei`'s `useFBX` (which caches by URL, so
all ten NPCs plus the player share only two underlying downloads, not
twelve). A future pass could convert these to compressed GLB if a
conversion tool is approved.

## Avatar loading pipeline

`src/characters/avatar/`:

- `avatarConfig.ts` — the `AvatarVariant` registry (`nathan`/`sophia`),
  each entry's model/texture URL, native animation type, and scale;
  plus `pickAvatarVariant`/`pickTintColor` (deterministic hash-based
  assignment, seeded per character id).
- `PersonAvatar.tsx` — loads the FBX via `useFBX`, clones it per
  instance via `SkeletonUtils.clone` (`three-stdlib` — a plain
  `Object3D.clone()` does not correctly duplicate a skinned mesh's
  skeleton/bind pose, so every instance would otherwise fight over one
  shared animation state), applies the downscaled texture (cloned, not
  mutated, since `useTexture`'s return value may be shared/cached), and
  drives a per-instance `AnimationMixer` playing the model's one native
  clip. See docs/NPC_SYSTEM.md "Avatar variation" and
  docs/PLAYER_SYSTEM.md for how the player and NPCs each wire this in.

## Rules (unchanged)

- Never download or embed a copyrighted/trademarked 3D asset without
  verifying its licence permits this use (including commercial/public
  portfolio use) — done above for Renderpeople before any file was
  added to the repo.
- Do not reproduce real, trademarked hardware geometry — the embedded
  lab props remain intentionally generic/representative, not replicas.
- Prefer clean procedural/blockout geometry over an unverified "looks
  realistic" download — the office/furniture/equipment remain
  procedural; only the humans were upgraded, and only after license
  verification.
