# Virtual Board

## Model

`src/simulations/embedded/virtualBoard.ts`:

```ts
type BoardState = "OFF" | "READY" | "FLASHING" | "PROGRAMMED" | "RUNNING" | "FAULT";

interface VirtualBoardModel {
  boardId: string;
  displayName: string;
  state: BoardState;
  firmwareImage: VirtualFirmwareImage | null;
  gpio: Record<number, GpioPinState>;
  powerState: "OFF" | "ON";
}
```

Transitions (`reduceBoardEvent`, a pure reducer with no React/Three.js
dependency):

```
OFF --POWER_ON--> READY --BEGIN_FLASH--> FLASHING
FLASHING --FLASH_COMPLETE(image)--> PROGRAMMED --START--> RUNNING --STOP--> PROGRAMMED
FLASHING --FLASH_FAILED--> READY
PROGRAMMED --BEGIN_FLASH--> FLASHING   (re-flash)
any --RESET--> OFF (clears firmwareImage and gpio)
```

`FAULT` exists in the type for architectural completeness (a hook for
a future "board disconnected" scenario) but nothing in Milestone 4
currently drives a board into it.

## GPIO

`src/simulations/embedded/virtualGpio.ts`:

```ts
type GpioDirection = "INPUT" | "OUTPUT";
type GpioLevel = "LOW" | "HIGH";
interface GpioPinState { pin: number; direction: GpioDirection; level: GpioLevel; }
```

`configurePin(pin, direction)` initialises a pin `LOW`. `writePin(state,
level)` only applies the write if `state.direction === "OUTPUT"` —
writing to an `INPUT` pin is a documented no-op, not a thrown error
(matches the "GPIO direction validation" requirement without making the
simulation brittle).

The LED task configures pin 5 (from `DEMO_FIRMWARE_PROJECT
.expectedBehaviour.pin`) as `OUTPUT` exactly once, in
`useEmbeddedStore.startBoard()`, before starting the runtime.

## 3D representation

`src/world/office/props/EmbeddedBoard3D.tsx` — attached at the player
workstation's `boardAnchor` (`officeLayout.ts`). Visual components:

- PCB-like flat body (box)
- A small raised "MCU package" block
- Two rows of header pins (thin boxes)
- A power indicator LED (red, tracks `board.powerState`)
- The user LED (green, tracks `board.gpio[LED_PIN].level` — see below)

Deliberately generic: no real board's silkscreen layout, connector
placement, or branding is reproduced (see docs/ASSET_PIPELINE.md's
"no trademarked hardware geometry" rule). Geometry is a handful of
primitives — cheap enough that no instancing or LOD was needed for a
single board.

## LED state binding

The LED's `MeshStandardMaterial` is held in a `ref`, and every
`useFrame` the component reads the *current* GPIO level directly from
`useEmbeddedStore.getState()` (not a prop, not a subscribed hook value
— a direct read, so this doesn't trigger a React re-render on every
GPIO toggle, only a material property mutation):

```ts
useFrame(() => {
  const pin = useEmbeddedStore.getState().board.gpio[ledPin];
  const isOn = pin?.level === "HIGH";
  material.emissiveIntensity = isOn ? 1.6 : 0.05;
});
```

This is the deliberate alternative to "toggle a boolean in a UI timer
and animate the mesh directly" — the 3D LED has no animation state of
its own; it is a pure function of `VirtualGPIO` state, exactly as the
Milestone 4 brief requires ("the visual LED must subscribe to or read
actual virtual GPIO state").

## No dynamic point light

The LED uses only an emissive material change (color + emissive
intensity) — no `<pointLight>` is attached to it, regardless of quality
profile. At normal workstation viewing distance an emissive sphere
reads clearly as "lit," and adding a real-time light here would be
exactly the kind of "excessive 3D LED light" the performance brief
warns against for a value with no strong visual payoff.
