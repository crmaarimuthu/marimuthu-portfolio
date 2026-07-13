# Player System

## Status

The player now renders as a real human model (a licensed Renderpeople
FBX asset — see `docs/ASSET_PIPELINE.md` and `docs/NPC_SYSTEM.md`
"Avatar variation") in place of the earlier capsule placeholder. A
richer avatar/GLB pipeline (configurable body/hair/clothing, a full
matched animation clip set) remains future work (was originally scoped
as "Milestone 2" and has not been fully implemented — only one
walk-cycle clip is available for the player's chosen model). This
document describes the player *systems* (locomotion, config, collision,
seated interaction) that exist today, which the avatar swap plugged
into without needing to change — `PlayerCapsule.tsx` still owns
transform/collision/animation-*state* math and now renders
`<PersonAvatar>` instead of raw capsule geometry.

## Modules

- `src/player/PlayerConfig.ts` — shared constants: capsule
  height/radius (`PLAYER_CAPSULE_HEIGHT`, `PLAYER_RADIUS`) and the
  sit/stand transition duration (`SEAT_TRANSITION_DURATION_SEC`).
  Centralised so locomotion, collision, and any future avatar rigging
  agree on the same scale.
- `src/player/playerMovement.ts` — `computeNextPlayerTransform`, a pure
  function of `(currentTransform, InputState, dt, cameraYaw) ->
  nextTransform`. Unaware of collision, chairs, or the office — it only
  integrates walk/run speed and heading. Movement is **camera-relative**:
  the target heading is `cameraYaw + atan2(moveX, moveY)`, so "push
  forward" always means "away from wherever the camera is currently
  looking," and the character turns to face whichever direction is
  being pushed relative to the camera — not a fixed world axis. Omitting
  `cameraYaw` defaults to `0` (world-relative), preserved for tests.
- `src/world/office/collision.ts` — `resolveWallCollisions`, applied
  *after* `computeNextPlayerTransform` each frame in
  `PlayerCapsule.tsx`, to keep locomotion math and collision math
  independently testable.
- `src/player/animationState.ts` — the animation state machine (see
  `docs/ANIMATION_SYSTEM.md`).
- `src/player/PlayerCapsule.tsx` — the R3F component that ties the
  above together every frame; also owns the seated-transition lerp
  (position/heading interpolation while `TRANSITIONING`) and a simple
  arcade jump (gravity + initial upward velocity, visual hop only — no
  jump animation clip exists, see docs/ANIMATION_SYSTEM.md).
- `src/player/CameraController.tsx` — full free-look third-person orbit
  camera (yaw + pitch), decoupled from `PlayerCapsule` (reads a
  transform getter, not the component's internals). See "Mouse look"
  below.
- `src/player/MouseLookController.tsx` — requests Pointer Lock on
  canvas click (desktop) and feeds `mousemove`'s `movementX/Y` into
  `InputManager.addLookDelta`; actively releases pointer lock when
  disabled (workstation mode, an open dialogue).
- `src/ui/TouchLookArea.tsx` — the mobile equivalent: a drag region
  (right ~60% of the HUD) reporting per-frame drag deltas into the same
  `addLookDelta` call.
- `src/player/InteractionController.tsx` — resolves nearby
  interactables and dispatches into `useOfficeStore` (see
  `docs/INTERACTION_SYSTEM.md`); does not touch locomotion directly.

## Mouse look / camera orbit

`CameraController` holds `yaw`/`pitch` in local refs, updated every
frame from `InputState.lookDeltaX/Y` (`yaw -= lookDeltaX * sensitivity`,
matching Three.js `OrbitControls`' left-drag convention; `pitch`
clamped to `[-15°, 75°]` so the camera can't flip over the top or dip
below the floor). This yaw is **independent of the player's own
heading** — it's a free-look orbit, not a fixed follow-cam — and is
exposed via `onYawChange` to `Experience.tsx`, which feeds it to
`PlayerCapsule` as `getCameraYaw()` for camera-relative movement (see
above). On mount, yaw initializes to the player's current heading so
the camera starts directly behind the character, exactly as it did
before free-look existed.

## Jump

Space (desktop) or the mobile **Jump** button
(`InputManager.triggerJump()`) sets a one-shot `jumpPressed` flag.
`PlayerCapsule` applies a simple gravity simulation (`GRAVITY`,
`JUMP_SPEED` constants) only while grounded
(`jumpHeight <= 0 && jumpVelocity <= 0`) and only during `NORMAL`
locomotion — jumping is disabled while seated, mid sit/stand
transition, or during a dialogue. This is a visual hop (`groupRef`'s Y
position), not a new `PlayerAnimationState` — no jump animation clip
exists for the current avatar (see docs/ANIMATION_SYSTEM.md), so adding
a formal `JUMP` state would have nothing to render differently.

## Locomotion states

`PlayerCapsule` reads `chair.playerState` from `useOfficeStore` each
frame to decide which of three modes it's in:

- **`NORMAL`** — ordinary input-driven locomotion + wall collision, as
  in Milestone 1.
- **`TRANSITIONING`** — a short (0.35s) position/heading lerp toward
  either the chair's sit anchor or its stand anchor; input is ignored.
- **`SEATED`** — the player is held at the cached seat anchor; input is
  ignored (standing is triggered externally via F, handled by
  `InteractionController`, not by `PlayerCapsule` polling for it). This
  is also the locomotion mode for the entire Milestone 4 workstation
  session (`TYPE`/`DEBUG`/`INSPECT_BOARD`/`CELEBRATE` animation states
  all occur while `chair.playerState` stays `SEATED` — only the
  animation sub-state changes, not the locomotion mode).

This three-way split is what lets a chair "reserve → transition →
occupy" without `PlayerCapsule` needing to know anything about chairs,
doors, or the office layout — it only needs a target `{x, z, heading}`
and a duration, both supplied via `useOfficeStore.pendingTransition`. It
is also what let the embedded firmware task (Milestone 4) reuse the
exact same `SEATED` handling without any change to `PlayerCapsule`:
`useEmbeddedStore` only ever calls `useOfficeStore.requestWorkAnimation`
to change *which* seated animation is showing, never the chair/
locomotion state itself.

## Collision

Player is treated as a circle of `PLAYER_RADIUS` (0.35m) against the
office's static AABB wall list (`useOfficeCollisionWalls()`, derived
from `wallSegments.ts` + live door state) — see
`docs/OFFICE_WORLD.md` "Collision (simplified)".

## Why animation/office state live in `useOfficeStore`, not `PlayerCapsule` props

Milestone 1's `ARCHITECTURE.md` explicitly avoids pushing per-frame
locomotion state into Zustand (to avoid unnecessary re-renders). That
guidance still holds: `IDLE`/`WALK`/`RUN` remain a local ref inside
`PlayerCapsule`, updated at input-cadence, never touching React state.
Sit/stand/workstation state is different — it changes rarely (on
explicit player action), and multiple independent components (HUD,
`Door`, `InteractionController`, `PlayerCapsule`) all need to read or
react to it, which is exactly the cross-cutting case Zustand is for.
