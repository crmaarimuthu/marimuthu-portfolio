# Team System

## Model

`src/characters/teams/Team.ts`:

```ts
type TeamId = "LEADERSHIP" | "PEOPLE_OPERATIONS" | "EMBEDDED_SYSTEMS" | "SOFTWARE" | "VALIDATION";

interface Team {
  id: TeamId;
  displayName: string;
  department: string;
  teamLeadId: string | null; // null for teams with no dedicated lead (e.g. LEADERSHIP)
  memberIds: string[];
  homeZone: string;
  meetingRoomZone: string;
}
```

Content lives in `src/content/teams.json` (data-driven, not hardcoded
in behaviour code), loaded and validated by
`src/characters/npc/npcContent.ts` alongside the NPC roster.

## The five teams

| Team | Lead | Members | Home zone |
|---|---|---|---|
| LEADERSHIP | — | CEO | executive |
| PEOPLE_OPERATIONS | — | HR | hr |
| EMBEDDED_SYSTEMS | Team Lead (Arun) | 2 embedded engineers | embeddedLab |
| SOFTWARE | — | 2 software engineers | engineering |
| VALIDATION | — | 1 validation engineer | engineering |

Only `EMBEDDED_SYSTEMS` has a dedicated `teamLeadId` — matching the
roster's single `TEAM_LEAD`-role NPC (Arun). `LEADERSHIP` and
`PEOPLE_OPERATIONS` intentionally have `teamLeadId: null`; the manager
role (Rahul) oversees engineering broadly and isn't tied to one of the
five specific teams (`teamId: null` on that NPC).

## Validation

`validateTeams(teams, npcs)` (pure, no side effects) checks:

- Every `teamLeadId` references a real NPC.
- Every `memberIds` entry references a real NPC.
- Every NPC's `teamId` references a real team.
- A member assigned to more than one team produces a `WARNING` (first
  assignment wins) rather than an `ERROR` — a soft misconfiguration,
  not a hard failure.

Diagnostics never throw; `npcContent.ts` logs any `ERROR`-level
diagnostic to the console in development so a content typo is loud
during development without crashing the office simulation for a
visitor.

## Team Lead behaviour

The Embedded Systems team's `TEAM_LEAD` (role metadata:
`meetingEligible: true`) is the one NPC whose schedule template
(`team-lead`) places a `MEETING` block that the orchestrator routes to
`team-discussion-1` (a `TEAM_DISCUSSION_POINT`, see
`docs/NAVIGATION_SYSTEM.md`) rather than the formal meeting room —
modelling an informal team huddle near the team-lead desk cluster
rather than a full room-booked meeting. The two embedded engineers on
the same team share the same schedule template, so their meeting
blocks (with per-NPC seeded offsets) tend to land close together in
simulated time, producing a believable "team gathers near the lead's
desk" moment without any explicit cross-NPC coordination logic — it
falls out naturally from all three NPCs sharing one `scheduleTemplateId`.
