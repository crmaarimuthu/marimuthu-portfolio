# Embedded Simulation (Milestone 4)

## Simulation boundary (read this first)

**Nothing in this system compiles, links, flashes, or executes real
code, and no real hardware is ever involved.** Specifically:

- No visitor-supplied code is ever accepted or executed. The only C
  source shown is a fixed, bundled demonstration project
  (`src/simulations/embedded/FirmwareProject.ts`).
- No compiler (GCC/Clang/ARM GCC/MSVC or otherwise) actually runs,
  client- or server-side. The build output panel is explicitly labelled
  **SIMULATED TOOLCHAIN**.
- No real debug probe (J-Link/ST-Link/DAP/USB) is used or claimed. The
  flash panel is explicitly labelled **VIRTUAL DEBUG INTERFACE**.
- The "board" is a generic, non-trademarked 3D prop
  (`src/world/office/props/EmbeddedBoard3D.tsx`) — no physical MCU is
  connected, and the UI never claims one is.
- The "firmware image" produced after a successful build
  (`VirtualFirmwareImage`) is simulation metadata (a project id, a
  deterministic content checksum, a behaviour descriptor) — not a real
  MCU binary.

This entire workflow exists to demonstrate the *shape* of an embedded
engineering workflow (project → build → flash → run → observe →
verify) as an interactive portfolio piece, not to actually build
firmware.

## Firmware project model

`src/simulations/embedded/FirmwareProject.ts` defines a typed,
trusted-content model:

```ts
interface FirmwareProject {
  id: string;
  name: string;
  language: "C";
  standard: "C17";
  sourceFiles: { path: string; content: string }[];
  targetBoardId: string;
  buildProfile: string;
  expectedBehaviour: { type: "GPIO_BLINK"; pin: number; intervalMs: number };
}
```

The shipped demo, `DEMO_FIRMWARE_PROJECT` ("Virtual GPIO LED Blink"), is
a single `main.c` implementing a standard GPIO blink loop
(`LED_PIN = 5`, `BLINK_INTERVAL_MS = 500`) — structurally identical to
real embedded C, but never executed. The `CodeViewer` component
(`src/ui/workstation/CodeViewer.tsx`) reads `sourceFiles` directly, so
the source text exists in exactly one place (`FirmwareProject.ts`), not
duplicated across UI components.

`expectedBehaviour` is the safety boundary for the runtime (see below):
it's a small, fixed, typed descriptor — not a script, not a function,
not arbitrary code — so the "behaviour interpreter"
(`VirtualFirmwareRuntime`) only ever needs to understand one shape
(`GPIO_BLINK`) rather than parse anything.

## Build system

`src/simulations/embedded/buildSimulator.ts`:

- `validateFirmwareProject(project)` — deterministic structural checks
  (entry point present, target board configured, GPIO pin/interval
  well-formed) producing typed `BuildDiagnostic[]` (`INFO`/`WARNING`/
  `ERROR`). This is real validation of the trusted project data, not a
  fake compiler.
- `nextBuildStage(current, isValid)` — pure staged-state advance:
  `IDLE → VALIDATING → COMPILING → LINKING → SUCCESS`, or `FAILED` the
  moment `VALIDATING` finds an `ERROR` diagnostic. Timing (how long each
  stage is shown) is intentionally *not* part of this pure function —
  see "Runtime lifecycle" below.
- `buildOutputLine(stage, project)` — the human-readable log line for
  each stage, always prefixed `[INFO]`/`[ERROR]` and never claiming a
  real toolchain ran.

A deterministic failure is only ever produced by an explicit,
demo-configured flag (`startBuild({ forceFailure: true })`) — never a
random/simulated compiler error. This satisfies "if a failure mode is
provided for demonstration, it must be explicitly configured and
deterministic."

On `SUCCESS`, `createVirtualFirmwareImage` (`virtualFirmwareImage.ts`)
produces a `VirtualFirmwareImage` with a deterministic FNV-1a checksum
over the trusted source content (chosen over `crypto.subtle.digest`
specifically because it's synchronous, keeping the whole build pipeline
composed of small, pure, directly-testable functions).

## Flash system

`src/simulations/embedded/flashSimulator.ts` mirrors the build
simulator's shape:

- `validateFlashTarget({ image, boardId, boardAvailable,
  boardCurrentlyFlashing })` — checks the image exists, targets the
  connected board, and the board isn't already busy.
- `nextFlashStage`: `IDLE → CONNECTING → ERASING → PROGRAMMING →
  VERIFYING → SUCCESS`/`FAILED`.
- `flashOutputLine` — always attributes the connection to **VIRTUAL
  DEBUG INTERFACE**, never a named real probe.

## Virtual board & GPIO

`src/simulations/embedded/virtualBoard.ts` — `VirtualBoardModel` states
`OFF → READY → FLASHING → PROGRAMMED → RUNNING` (`→ PROGRAMMED` on
`STOP`), plus `FAULT`, via a pure reducer (`reduceBoardEvent`)
completely decoupled from React — the board is domain logic, not a
component.

`src/simulations/embedded/virtualGpio.ts` — `GpioPinState` (`pin`,
`direction: INPUT|OUTPUT`, `level: LOW|HIGH`). `writePin` enforces
direction: a write to a pin not configured `OUTPUT` is silently
rejected (state unchanged), matching real GPIO semantics.

## Runtime lifecycle

`src/simulations/embedded/virtualFirmwareRuntime.ts` —
`VirtualFirmwareRuntime` is the one piece of this system that owns a
real timer (`setInterval`), and only because a blink genuinely needs
one. It:

- Reads only the trusted `expectedBehaviour` descriptor — it does not
  parse or execute the C source text in any way.
- Guards `start()` against duplicate timers (calling it while already
  running is a no-op) and exposes `stop()`/`reset()`/`dispose()` for
  clean lifecycle management.
- Is paused/resumed by `useOfficeStore`... no — by `useEmbeddedStore`'s
  `pauseRuntimeForVisibility`/`resumeRuntimeForVisibility`, wired to the
  Page Visibility API in `Scene.tsx` (the same `documentVisible` signal
  that already toggles the R3F `frameloop`, see docs/PERFORMANCE.md) —
  so a backgrounded tab doesn't keep "blinking" (and potentially
  reaching task success) while the player isn't there.

The orchestrating store, `src/state/useEmbeddedStore.ts`, owns the
runtime instance and staged-progression `setTimeout` chains as
module-scoped variables (not Zustand state — they're singleton
side-effect resources, the same pattern as `useOfficeStore`'s door
animation). Every `startBuild`/`startFlash`/`startBoard` action clears
any prior timer/runtime before starting a new one, so retrying never
creates duplicates.

## LED event flow

The 3D LED (`EmbeddedBoard3D.tsx`) never runs its own animation loop.
Each `useFrame`, it reads `useEmbeddedStore.getState().board.gpio[pin]`
directly and sets the LED material's color/emissive intensity from that
one value:

```
VirtualFirmwareRuntime (timer tick)
  → onToggle(level)
    → writePin(...) updates board.gpio in the store
      → EmbeddedBoard3D's useFrame reads board.gpio[pin].level
        → material.emissiveIntensity set from level
```

No point light is attached to the LED (an emissive material alone
reads clearly at close workstation range) — this avoids adding a
per-frame dynamic light regardless of quality profile, per
docs/PERFORMANCE.md's "avoid excessive 3D LED lights" guidance.

## Task success requirements

`src/simulations/embedded/successEvaluator.ts` — `evaluateTaskSuccess`
requires **all** of: build success, flash success, board running,
correct GPIO direction, an observed `HIGH`, an observed `LOW` (proof the
LED is actually blinking, not stuck), and confirmation the runtime is
driving the project's actual configured behaviour. Checked after every
GPIO toggle (`checkTaskSuccess` in `useEmbeddedStore.ts`) — never
immediately after `START_BUILD`.

## Celebration & achievement

On success: the embedded task state machine moves
`BOARD_RUNNING → TASK_SUCCESS → CELEBRATING → COMPLETED`, in parallel
with the player animation state (`useOfficeStore.requestCelebration()`,
`INSPECT_BOARD → CELEBRATE → SITTING` after ~2.2s), a compact (no
confetti) `SuccessNotification`, and `unlockAchievement` — persisted to
`localStorage` (`portfolio.achievements`) and **not** cleared by Reset
Demo, since it's a permanent portfolio record of having completed the
task at least once. See `docs/PRIVACY_REVIEW.md`-style framing: the
achievement description explicitly says "interactive portfolio
simulation," never implying a certification.

## Task reset

`useEmbeddedStore.resetDemo()`: disposes the runtime, clears all
pending timers, resets the board/GPIO/build/flash/task state back to
`NOT_STARTED`, and — if the player is still seated in workstation mode
— immediately re-enters `WORKSTATION_READY` so the IDE stays usable
without a page reload or standing up. The achievement flag is
deliberately excluded from the reset.

## Mobile UX

See `docs/WORKSTATION_IDE.md` "Mobile layout".

## Current limitations

- The C tokenizer (`cSyntaxHighlight.ts`) is a lightweight,
  single-project-scoped highlighter — not a general C lexer (see
  docs/WORKSTATION_IDE.md for the bundle-size rationale).
- Only one demonstration project/board exists; the architecture (typed
  `FirmwareProject`, board/GPIO reducers) supports more, but only one is
  wired into the UI.
- CAN/Modbus/BMS/EMS demos referenced in the wider project brief are not
  implemented — only the GPIO blink task.
