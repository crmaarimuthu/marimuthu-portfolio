# Office World (Milestone 3)

## Scale

**1 world unit = 1 metre.** Wall height 3.2m, wall thickness 0.25m,
entrance/door gap 2.8m wide (two 1.4m half-widths) — human/office-realistic
proportions, not oversized "game-y" rooms.

## Public-safe fictionalisation

The entire layout in `src/world/office/officeLayout.ts` is an invented,
generic professional IT/embedded office. No real employer's floor plan,
room count, or department arrangement was referenced. `companyDisplayName`,
`buildingDisplayName`, `publicDescription`, and `buildingLabel`
(`src/config/workplace.ts`) are `TODO_USER_INPUT` until the user supplies
real, public-safe values — see `docs/PRIVACY_REVIEW.md`. Room *labels*
(RECEPTION, ENGINEERING, etc.) are generic role names, not real people or
teams.

## Layout

Building footprint: 28m (X) × 20m (Z), entrance on the south wall (+Z,
facing the Milestone 1 outdoor spawn area). Interior is a mix of
**open-plan zones** (no walls — lobby, engineering, embedded lab,
team-lead area) and **enclosed rooms with a door** (pantry, HR, manager,
meeting, executive/CEO):

```
z = -14  ┌─────────────── LOBBY ───────────────┐  ← entrance (+Z)
         │                                PANTRY│  (enclosed)
z = -19  ├── TEAM LEAD ──┬── ENGINEERING ─┬ EMBEDDED LAB ┤  (open-plan)
z = -27  ├──── HR ───────┼─── MANAGER ────┼ MEETING ┬ EXECUTIVE ┤ (enclosed)
z = -34  └───────────────┴────────────────┴─────────┴───────────┘
        x=-14                                              x=14
```

Zone classification is a pure, ordered point-in-rectangle test
(`resolveOfficeZone` in `officeLayout.ts`, exercised by
`officeLayout.test.ts`) — more specific carve-outs (pantry within the
lobby band, team-lead within the engineering band) are checked before
the broader zone they sit inside.

## Doors

`src/world/office/doorState.ts` implements a deterministic reducer:
`CLOSED → OPENING → OPEN → CLOSING → CLOSED`, plus `LOCKED`. Invalid
transitions (e.g. `REQUEST_OPEN` while `OPEN`, or on a `LOCKED` door) are
rejected — the reducer returns the same state. All Milestone 3 doors
start `CLOSED` and are player-openable via interaction (not
proximity-auto-open) so the player must deliberately choose to enter
each room. `<Door>` (`props/Door.tsx`) owns the swing animation locally
(a simple per-frame angle lerp) and dispatches
`OPEN_ANIMATION_DONE`/`CLOSE_ANIMATION_DONE` back into the shared
`useOfficeStore` once the swing completes.

## Collision (simplified)

Full mesh collision was judged too expensive for a browser/mobile
target. Instead, `src/world/office/wallSegments.ts` derives a static
list of axis-aligned wall boxes (exterior shell + every enclosed room,
each wall split around its door gap), and
`src/world/office/collision.ts` resolves the player as a **circle**
against those boxes each frame (`resolveWallCollisions`, unit-tested).
A door's wall-gap segment is only non-colliding while that specific door
is fully `OPEN` (`isDoorTraversable`) — mid-swing doors still block, by
design, to avoid the player capsule clipping through a half-open door
mesh.

**Known limitation:** collision is planar (X/Z) only — there's no floor
raycast or vertical collision, since Milestone 3 is a single flat floor.

## Interaction system

See `docs/INTERACTION_SYSTEM.md` for target selection, chair flow, and
workstation mode in detail.

## Indoor camera

`CameraController` (`src/player/CameraController.tsx`) checks
`isIndoorZone(resolveOfficeZone(...))` every frame and switches to a
shorter, lower follow offset indoors. This is a practical distance
reduction, not true camera-vs-wall collision — a raycast-based version
is future work, and keeping this decision inside `CameraController`
(rather than `PlayerCapsule`) is what makes that upgrade a local change.

## Performance

- All repeated wall segments render as **one instanced mesh**
  (`OfficeStructure.tsx`, drei's `<Instances>`), not one draw call per
  wall.
- Engineering/team-lead desks render as instanced desk/monitor/chair
  clusters (`DeskCluster.tsx`) — five draw calls total regardless of
  desk count.
- A small, fixed material palette is shared across the whole office
  (`OfficeMaterials.tsx`) instead of allocating materials per mesh.
- `QualityProfile.environmentDetail === "LOW"` skips the second embedded
  lab bench (`OfficeInterior.tsx`); shadows are globally gated by the
  Canvas's `shadows` prop (already tied to the quality profile since
  Milestone 1) so `castShadow`/`receiveShadow` become no-ops at LOW/
  MEDIUM without extra per-mesh branching.
- Room labels use SDF text (`drei`'s `<Text>`) rather than per-label
  render targets/canvases.

## Asset budget (Milestone 3, current)

All geometry is procedural blockout (boxes, cylinders, spheres) — no
external 3D model files are loaded yet. See `docs/ASSET_PIPELINE.md`.

## Known limitations

- Doors mid-swing block movement rather than partially opening for
  collision purposes (documented above).
- Camera indoor handling is a distance reduction, not a wall raycast.
- No skinned/animated avatar yet — the player is still the Milestone 1
  capsule, with a simple scale-based "seated" visual cue (see
  `docs/ANIMATION_SYSTEM.md`).
- Only the entrance and the five enclosed-room doors exist; there is no
  interior corridor/second floor.
- No NPCs occupy the office yet — reception/desks are unoccupied
  placeholders for Milestone 5.
