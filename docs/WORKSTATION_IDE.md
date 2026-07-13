# Workstation IDE

## Mount lifecycle

`src/ui/workstation/WorkstationIDE.tsx` is a DOM overlay (not inside the
R3F `Canvas`, same pattern as `Hud.tsx`), rendered by `Scene.tsx` only
while `useOfficeStore.workstation.mode === "ACTIVE"` (set by the
Milestone 3 `USE_WORKSTATION` interaction). Its own mount effect fires
`useEmbeddedStore.enterWorkstation()` — this is what keeps the office
workstation-mode state and the embedded task state machine in lockstep
without either module polling the other.

## Layout areas (all milestone-4-required)

- **Project explorer** — a minimal "Open Project" affordance shown
  while `taskState === WORKSTATION_READY` (there's only one demo
  project, so this is a single button rather than a tree view; the
  architecture — `FirmwareProject[]` — supports more later).
- **Code viewer** — `CodeViewer.tsx`, read-only, line-numbered,
  C-syntax-highlighted (see below), horizontally scrollable for long
  lines.
- **Build controls + output** — `BuildPanel.tsx`.
- **Flash controls + output** — `FlashPanel.tsx`.
- **Board status** — `BoardStatusPanel.tsx`.

## Code viewer

`CodeViewer.tsx` + `cSyntaxHighlight.ts`. **Decision: no third-party
syntax-highlighting library.** A full solution (Prism, CodeMirror,
Monaco) would add real bundle weight for a single, fixed, read-only
demo file — massive overkill. Instead, `tokenizeCLine` is a ~40-line
regex-based classifier covering preprocessor directives, line comments,
string literals, numbers, a small keyword/type set, and punctuation —
enough for the one bundled `main.c` to read clearly, at effectively
zero bundle cost. It is explicitly *not* a general C lexer (no
multi-line comments, no macro expansion) — sufficient for trusted,
fixed content, not designed for arbitrary input.

## Desktop layout

Two-column grid: code viewer (left, wider) + a scrollable stack of
build/flash/board panels (right). Keyboard shortcuts (only active while
the IDE is mounted):

| Shortcut | Action | Guarded by |
|---|---|---|
| `Ctrl`/`Cmd` + `B` | Start build | only while `taskState === SOURCE_READY` |
| `F` | Start flash | only while `taskState === FLASH_READY` |
| `R` | Run board | only while `taskState === BOARD_READY` |
| `Escape` | Exit workstation mode | always |

None of these override browser-critical shortcuts (`Ctrl+B` is
`preventDefault`-ed only because some browsers bind it to a bookmarks
sidebar toggle that isn't critical to override in this context; `F`/`R`
alone have no browser-reserved meaning). **Key conflict note:** Milestone
3 bound `F` to "stand up from chair" globally. While the workstation IDE
is mounted, `F` means "flash" instead — `InteractionController`'s stand
handling already only fires while `chair.playerState === "SEATED"` *and*
implicitly the player would need to have exited the IDE via `Escape`
first to reach the F-stand HUD prompt again in practice, since the IDE
overlay captures the keydown before it'd be visually relevant; see
`docs/MOBILE_CONTROLS.md`/`docs/INTERACTION_SYSTEM.md` for the base F
binding.

## Mobile layout

Four tabs — **CODE / BUILD / FLASH / BOARD** — rendered by
`MobileLayout` inside `WorkstationIDE.tsx`, switching which single panel
is visible so the code viewer isn't squeezed alongside the control
panels on a narrow screen. Tab buttons and all IDE buttons are
comfortably touch-sized (matching the ≥44px-equivalent targets used
elsewhere in the HUD). Portrait mode is usable (the layout is just
narrower); the brief's "may show a rotate recommendation" for portrait
was evaluated and skipped for Milestone 4 — the tabbed layout already
degrades acceptably in portrait, so an extra rotate-prompt UI wasn't
justified.

## Mobile input isolation

While `workstation.mode === "ACTIVE"`:

- `Hud.tsx` returns `null` entirely — the joystick, run button, and
  context-interaction button are hidden (not just disabled), since the
  full-screen IDE overlay occupies the same screen region and normal
  locomotion is already paused (`chair.playerState !== "NORMAL"`, per
  `docs/PLAYER_SYSTEM.md`).
- No camera-touch region exists yet in this codebase (Milestone 2 scope,
  not implemented), so there's nothing further to isolate there.

## Success notification & reset

`SuccessNotification.tsx` — a compact, dismissible, non-confetti banner
shown on `TASK_SUCCESS`. `WorkstationIDE`'s header always exposes
**Reset Demo** (`useEmbeddedStore.resetDemo()`) regardless of task
state, and **Exit (Esc)** (`useOfficeStore.exitWorkstationMode()`,
which does not affect the chair/task state — see
`docs/EMBEDDED_SIMULATION.md` "Task reset").
