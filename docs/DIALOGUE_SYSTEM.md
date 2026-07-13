# Dialogue System

## No external AI required

All dialogue is **structured, offline, bundled content** — a fixed set
of nodes and choices per NPC role, shipped in `src/content/dialogue/*.json`.
Nothing here calls an external AI API; the whole system works
completely offline and deterministically. (An AI-backed dialogue
adapter remains architecturally possible as a future extension, per the
wider project brief's "future-ready AI dialogue adapter" note, but is
explicitly out of scope here and not stubbed in.)

## Content model

`src/dialogue/DialogueSystem.ts`:

```ts
interface DialogueChoice {
  id: string;
  playerText: string;
  nextNodeId: string | null; // null = ends the conversation
}
interface DialogueNode {
  id: string;
  npcLine: string;
  choices: DialogueChoice[];
}
interface DialogueProfile {
  id: string;
  rootNodeId: string;
  nodes: Record<string, DialogueNode>;
}
```

`getDialogueNode`/`selectDialogueChoice` are pure functions — the
"current node" lives in `useNpcStore`'s `DialogueSession`, not in the
dialogue module itself, so the traversal logic stays trivially
testable without any store/React dependency.

## Content files (one per dialogue category)

`src/content/dialogue/{ceo,hr,manager,team-lead,embedded-engineer,
software-engineer,validation-engineer,generic}.json` — matching every
role-relevant `dialogueProfileId` used in `content/npcs.json`, plus a
`generic` fallback (`getDialogueProfile` falls back to it for any
unknown/missing profile id, so a content typo never crashes a
conversation). Each profile's root offers 2–4 topic choices plus an
exit choice; topic nodes offer "ask something else" (back to root) and
exit. Topics follow the brief's role guidance directly — e.g. the
embedded-engineer profile covers C/Embedded C, MCU targets, and CAN/
RS485/Modbus, the validation-engineer profile covers testing and
communication-protocol validation.

**Validation:** `validateDialogueProfile` checks every choice's
`nextNodeId` resolves to a real node and the profile's `rootNodeId`
exists; `dialogueContent.ts` runs this over every bundled profile at
import time and is itself asserted empty in
`DialogueSystem.test.ts` ("all shipped dialogue profiles pass
validation").

## Player introduction connection

Several profiles include a topic that directs the visitor to the
player character — e.g. the CEO profile's "portfolio-owner" node reads
*"You should go speak with {{profileName}} directly..."*.
`{{profileName}}`/`{{profileTitle}}` are the only placeholders dialogue
content may use, substituted by `renderDialogueText()` **from the
existing, user-supplied `config/profile.ts`** — never invented. If
`profileConfig` fields are still `TODO_USER_INPUT` placeholders,
that's exactly what renders; no fabricated content is introduced at
this layer.

## Runtime flow (useNpcStore)

1. `InteractionController` resolves `TALK_TO_NPC` via
   `useNpcInteractables()` (mirrors `useOfficeInteractables()`'s shape —
   see `docs/INTERACTION_SYSTEM.md`) and calls `useNpcStore.startDialogue(npcId)`.
2. `startDialogue` validates the NPC's current state permits
   interruption (via `reduceNpcState`'s `APPROACHED_BY_PLAYER` handling
   — see `docs/NPC_SYSTEM.md`), moves it to `TALKING`, and opens a
   `DialogueSession` at the resolved profile's root node.
3. `chooseDialogueOption(choiceId)` advances the session via
   `selectDialogueChoice`; a `null` `nextNodeId` (an "exit" choice) or an
   explicit "no next node" both call `endDialogue()`.
4. `endDialogue()` fires `DIALOGUE_ENDED` on the NPC's state machine,
   which restores whatever state was active before the interruption
   (see `docs/NPC_SYSTEM.md`), and clears the session.

No more than one `DialogueSession` can be open at a time — `useNpcStore
.dialogue` is a single nullable field, and `useNpcInteractables()`
returns no candidates at all while a session is open (so a second
`TALK_TO_NPC` can't be triggered mid-conversation).

## Player animation during dialogue

The player has no `TALK` animation state yet (`animationState.ts`'s
documented future-states list explicitly still includes `TALK`). Per
the brief's own fallback instruction ("if TALK animation is unavailable,
use IDLE fallback"), `PlayerCapsule` holds the player at `IDLE` for the
duration of any dialogue rather than adding a placeholder `TALK` state
prematurely — see `docs/ANIMATION_SYSTEM.md`.

## Movement suspension

While `useNpcStore.dialogue !== null`:

- `PlayerCapsule` (in its `NORMAL` locomotion branch) stops consuming
  movement input entirely — the player is frozen in place, whether or
  not they were seated when the conversation started (dialogue can
  happen standing, unlike the workstation flow).
- `Hud.tsx` returns `null`, hiding the joystick and every interaction
  button — same rationale as workstation mode (`docs/WORKSTATION_IDE.md`
  "Mobile input isolation"): the `DialogueUI` overlay covers the same
  screen region, and there's nothing useful to interact with underneath
  it during a conversation.
- `InteractionController` short-circuits entirely (`if (dialogueActive)
  return`) — no new interaction can be triggered mid-conversation.

## Mobile UI

`src/ui/dialogue/DialogueUI.tsx` — a bottom sheet on touch devices
(`deviceClass === MOBILE | TABLET`) versus a centered panel on desktop,
both reusing the same node/choice rendering. Choice buttons are
larger on mobile (`mobileChoiceStyle`), the panel respects
`env(safe-area-inset-bottom)`, and long NPC lines/choice lists scroll
within the panel (`overflowY: auto`) rather than overflowing the
viewport. `Escape` exits on desktop; a visible "Exit" button works on
both.
