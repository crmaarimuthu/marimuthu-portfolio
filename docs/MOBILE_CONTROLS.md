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
  single-pointer assumption — a second touch-driven control (e.g. a
  future camera-look area) can be added without refactoring the
  joystick.
- **Reset on release/cancel**: both `pointerup` and `pointercancel`
  (covers interruptions like an incoming call or an OS gesture) snap
  the knob back to center and emit `(0, 0)`.

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

## Known limitations

- No touch camera-look yet — the camera is a fixed follow rig behind
  the character. Touch-drag orbit is planned for Milestone 2.
- No gamepad implementation yet, though `InputManager`'s shape (a
  single aggregator with named setters) is designed to accept one
  without changing `PlayerCapsule`.
