# Mobile Controls

## Input architecture

Desktop keyboard listeners and the mobile touch controls both write into
a single `InputManager` instance (`src/engine/input/InputManager.ts`).
`InputManager.consumeFrameState()` is called exactly once per frame, by
`Experience.tsx` (not by `PlayerCapsule` directly, as of Milestone 3 —
see docs/ARCHITECTURE.md), and the resulting `InputState` is shared via
a getter with both `PlayerCapsule` and `InteractionController`. Neither
has a branch for "is this a touch device," so behavior stays identical
regardless of which input source produced the state. This is what makes
gamepad support (a future milestone) additive rather than a rewrite.

## Virtual joystick

`src/ui/VirtualJoystick.tsx` renders a real analogue joystick (a
draggable knob inside a fixed-radius base), not four directional
buttons. It is backed by pure, unit-tested math in
`src/ui/joystickMath.ts`:

- **Dead zone**: pointer movement within 12% of the base radius
  (`DEAD_ZONE_RATIO`) outputs `{x: 0, y: 0}`, so small thumb jitter at
  rest doesn't cause drift.
- **Radius clamp**: movement is normalised to `[-1, 1]` on each axis and
  never exceeds unit magnitude, matching the clamp already applied to
  keyboard input in `InputManager`.
- **Pointer capture**: `setPointerCapture` is used on pointer-down so
  the drag continues to track even if the finger slides outside the
  joystick's DOM bounds.
- **Single-touch tracked, multi-touch safe**: the joystick only follows
  the first pointer that engages it (ignores extra simultaneous
  touches elsewhere on screen), while `InputManager` itself has no
  single-pointer assumption — this is exactly what let the camera-look
  touch region (`TouchLookArea.tsx`, see "Touch look" below) get added
  as a second simultaneous touch control without refactoring the
  joystick.
- **Reset on release/cancel**: both `pointerup` and `pointercancel`
  (covers interruptions like an incoming call or an OS gesture) snap
  the knob back to center and emit `(0, 0)`.

## Touch look

`src/ui/TouchLookArea.tsx` — a drag-to-orbit region covering the right
~60% of the screen (`left: 40%` to the edge), rendered *before* the
joystick/button HUD elements in `Hud.tsx`'s DOM order so those controls
(painted after, in the same stacking context) still win hit-testing
over the region beneath them — no manual "hole punching" needed.
Unlike the joystick, it reports per-move-event **deltas** (this
pointer's position minus its last known position), not an absolute
stick offset, feeding the same `InputManager.addLookDelta` desktop
mouse-look uses (see docs/PLAYER_SYSTEM.md "Mouse look"). It tracks
only the first pointer that touches it, same single-touch-per-control
policy as the joystick, so a thumb on the joystick (left) and a second
finger dragging to look (right) work simultaneously.

## HUD control layout

`src/ui/Hud.tsx` renders touch controls only when `deviceClass` is
`MOBILE` or `TABLET` (`src/engine/core/useDeviceClass.ts`, based on
`(pointer: coarse)` + viewport width, not user-agent sniffing alone):

- Joystick, bottom-left — movement.
- Run button + a **context-sensitive interaction button**, bottom-right
  — large (64px) touch targets with `touchAction: "none"` to prevent
  scroll/zoom gestures from hijacking the drag. The context button only
  renders when `useOfficeStore.interactionPrompt` is non-null, and its
  label (`OPEN`/`CLOSE`/`SIT`/`USE`/`EXIT`) tracks whichever intent
  `InteractionController` currently considers nearest/valid — it is
  hidden, not just disabled, when nothing is in range (see
  docs/INTERACTION_SYSTEM.md).
- A separate **STAND** button appears above the run/context pair only
  while the player is seated (`chair.playerState === "SEATED"`),
  positioned to avoid overlapping either the joystick or the
  run/interact pair.

Neither button overlaps the joystick's bottom-left footprint or a
future camera-look touch region (reserved as the remaining screen area
above the HUD controls).

Desktop shows a text control hint (WASD / Shift / E / F) plus a dynamic
"E — <label>" prompt (and "F — Stand" while seated), both driven by the
same `useOfficeStore.interactionPrompt`/`chair` state as the mobile
button — the HUD never talks to the 3D scene directly.

## Workstation mode (Milestone 4)

While `useOfficeStore.workstation.mode === "ACTIVE"`, `Hud.tsx` returns
`null` entirely — joystick, run, and context buttons all disappear,
since the full-screen `WorkstationIDE` overlay occupies the same screen
region and normal locomotion is already paused (the player is
`SEATED`). The IDE has its own touch-friendly CODE/BUILD/FLASH/BOARD
tab bar; see `docs/WORKSTATION_IDE.md` "Mobile layout" and "Mobile
input isolation".

## Dialogue mode (Milestone 5)

The mobile `TALK` context button (`INTENT_MOBILE_LABEL.TALK_TO_NPC`)
appears exactly like any other context-sensitive button when an NPC is
in range. Once a conversation starts, `Hud.tsx` hides entirely (same
`workstationActive`-style check, now also gated on `useNpcStore.dialogue
!== null`) and `DialogueUI`'s bottom-sheet layout takes over the same
screen region — see `docs/DIALOGUE_SYSTEM.md` "Mobile UI".

## Known limitations

- No gamepad implementation yet, though `InputManager`'s shape (a
  single aggregator with named setters) is designed to accept one
  without changing `PlayerCapsule`.
