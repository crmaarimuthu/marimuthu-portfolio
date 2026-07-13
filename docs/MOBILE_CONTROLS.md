# Mobile Controls

## Input architecture

Desktop keyboard listeners and the mobile touch controls both write into
a single `InputManager` instance (`src/engine/input/InputManager.ts`).
`PlayerCapsule` only ever reads `InputManager.consumeFrameState()` — it
has no branch for "is this a touch device," so behavior stays identical
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
- Run / Interact / Sit buttons, bottom-right — large (64px) touch
  targets with `touchAction: "none"` to prevent scroll/zoom gestures
  from hijacking the drag.

Desktop shows a text control hint (WASD / Shift / E / F) instead.

## Known limitations (Milestone 1)

- No touch camera-look yet — the camera is a fixed follow rig behind
  the character. Touch-drag orbit is planned for Milestone 2.
- No gamepad implementation yet, though `InputManager`'s shape (a
  single aggregator with named setters) is designed to accept one
  without changing `PlayerCapsule`.
