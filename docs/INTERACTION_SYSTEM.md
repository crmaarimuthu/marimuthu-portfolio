# Interaction System

## Target selection

`src/engine/interaction/InteractionSystem.ts` — `selectBestInteractable`
is a pure function of the player's planar transform (x, z, heading) and
a list of `InteractableDescriptor`s (id, position, intent, label,
radius, enabled). Selection rule: a candidate qualifies if it's within
`radius` **and** roughly within the player's forward hemisphere (dot
product of facing vector and direction-to-target above a threshold);
among qualifying candidates, the nearest wins.

This was chosen over a strict raycast because:
- It's forgiving on mobile — no precise aiming needed to interact with a
  door or chair.
- It naturally prevents interacting with something directly behind the
  player, or through a wall the radius doesn't reach (radius values are
  tuned per interactable — e.g. a door's 2.2m radius doesn't reach
  through to the next room).
- It's trivially pure/unit-testable (`InteractionSystem.test.ts`)
  without any Three.js raycaster or scene graph.

## Runtime wiring

`src/player/InteractionController.tsx` runs once per frame inside the
Canvas: it builds the current candidate list
(`useOfficeInteractables()`, `src/world/office/useOfficeRuntime.ts`),
calls `selectBestInteractable`, and publishes the result to
`useOfficeStore.interactionPrompt` so the DOM-based HUD
(`src/ui/Hud.tsx`) can render "E — <label>" (desktop) or a
context-sensitive button (mobile) without any HUD component needing to
know about the 3D scene.

## Intents

| Intent | Trigger | Effect |
|---|---|---|
| `OPEN_DOOR` | E, door `CLOSED` | `dispatchDoorEvent(id, "REQUEST_OPEN")` |
| `CLOSE_DOOR` | E, door `OPEN` | `dispatchDoorEvent(id, "REQUEST_CLOSE")` |
| `SIT_AT_CHAIR` | E, chair `AVAILABLE` & player `NORMAL` | `beginSit(anchor)` |
| `USE_WORKSTATION` | E, seated & workstation `INACTIVE` | `enterWorkstation()` |
| `EXIT_WORKSTATION` | E, seated & workstation `ACTIVE` | `exitWorkstationMode()` |
| `STAND_FROM_CHAIR` | **F** (dedicated shortcut, not E-selected) | `beginStand(anchor)` if the stand anchor is clear |
| `TALK_TO_NPC` (Milestone 5) | E, NPC in an interruptible state | `useNpcStore.startDialogue(npcId)` |

`TALK_TO_NPC` candidates come from a second candidate list,
`useNpcInteractables()` (`characters/npc/useNpcInteractables.ts`), built
the same way `useOfficeInteractables()` builds door/chair/workstation
candidates. `InteractionController` concatenates both lists before
calling `selectBestInteractable` — an NPC standing right next to an open
door competes for "nearest" on equal footing with the door itself, which
is the intended behaviour (whichever is actually closer/more in front of
the player wins). See `docs/DIALOGUE_SYSTEM.md` for the full
conversation flow, including why the candidate list becomes empty while
a dialogue session is already open (preventing a second simultaneous
conversation).

**Why standing is F, not an E-selected candidate:** once seated, the
player's own chair is the only thing they could possibly mean — there's
no ambiguity to resolve via nearest-target selection, and separating it
avoids a confusing situation where sitting back down accidentally
re-triggers if E is pressed twice. F was already the Milestone 1
sit/stand shortcut, so this preserves that muscle memory while E
becomes the general "resolve whatever's nearby" key per the Milestone 3
brief.

## Chair flow

`src/world/office/chairState.ts` — a 3-state chair (`AVAILABLE` /
`RESERVED` / `OCCUPIED`) paired with player locomotion state (`NORMAL` /
`SEATED` / `TRANSITIONING`):

1. `requestSit` validates chair availability + player idle, and returns
   `{chairState: RESERVED, playerState: TRANSITIONING}`.
2. `PlayerCapsule` lerps the player's position/heading from wherever
   they were standing to the configured sit anchor over
   `SEAT_TRANSITION_DURATION_SEC` (0.35s) — no teleporting.
3. On completion, `completeSit` moves to `{OCCUPIED, SEATED}`.
4. `requestStand` (triggered by F) validates seated state **and** that
   the stand anchor isn't blocked (`isPointBlocked`, using the same
   simplified wall-collision math as locomotion) before allowing the
   player to stand into a wall or desk.
5. `completeStand` returns to `{AVAILABLE, NORMAL}`.

All five functions are pure and unit-tested
(`chairState.test.ts`) independent of the 3D runtime.

## Workstation mode preparation

`src/world/office/workstationState.ts` — `USE_WORKSTATION` is only valid
once `seatedAtThisWorkstation` is true (derived from the chair's
`playerState === "SEATED"`). Milestone 3 only flips
`mode: INACTIVE → ACTIVE` and moves the camera toward
`PLAYER_WORKSTATION.cameraTarget` (via the existing `CameraController`
architecture) — it does **not** implement any build/flash/LED
simulation. Milestone 4 will listen for `workstation.mode === "ACTIVE"`
and take over from there. Standing up while workstation mode is active
automatically exits it (`beginStand` calls `exitWorkstation` as part of
the same store update).

## Animation integration

Sitting/standing drive the player animation state machine
(`src/player/animationState.ts`, extended in Milestone 3 with
`SIT_DOWN`/`SITTING`/`STAND_UP`) through the same store — see
`docs/ANIMATION_SYSTEM.md`.
