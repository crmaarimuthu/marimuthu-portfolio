# Navigation System

## Decision

**Hybrid zone graph + local steering**, not a full navigation mesh.

Evaluated against the existing engine/office architecture:

- The office (Milestone 3) is almost entirely open-plan by design —
  full mesh collision was already judged too expensive there, replaced
  with a simplified circle-vs-AABB wall resolver
  (`world/office/collision.ts`, see `docs/OFFICE_WORLD.md`). Baking or
  querying a real navmesh (e.g. via `recast-navigation-js`/WASM) for
  that same simple layout would add a real dependency and build step
  for very little benefit — the enclosed rooms are few, small, and
  door-gated, and the open zones are, well, open.
- A **waypoint graph over the same `ZONE_DEFINITIONS` rectangles
  already used for player-zone detection** (`world/office/officeLayout.ts`)
  reuses geometry the codebase already has a single source of truth
  for, at zero extra dependency cost. Zone *centers* become graph
  nodes; a small hand-authored adjacency list (`navigationGraph.ts`)
  connects zones that have a real walkable connection (open-plan
  boundary or a door) between them.
- Local steering *within* a leg of the route is a direct line toward
  the next waypoint (`NavigationAgent.ts`'s `advanceNavigationAgent`) —
  since each leg only spans one zone-to-zone hop, a direct line rarely
  crosses a wall, and NPC-vs-wall collision reuses the exact same
  resolver the player uses if it's ever needed (not currently applied
  to NPCs — see "Known limitations").

This keeps the whole navigation stack as a handful of small, pure,
unit-tested functions with no new runtime dependency, appropriate for
a browser/mobile target.

## Target registry

`src/navigation/navigationTargets.ts` — every place an NPC can be sent
is declared once as a typed `NavigationTarget` (`id`, `type`, `zone`,
position, heading, `occupancyCapable`), never as a raw coordinate
scattered through behaviour code. Types: `WORKSTATION`, `MEETING_SEAT`,
`PANTRY_POINT`, `BREAK_POINT`, `RECEPTION_POINT`, `OFFICE_EXIT`,
`TEAM_DISCUSSION_POINT`.

**Known simplification:** these positions are hand-placed to
approximate the furniture `OfficeInterior.tsx` actually renders (desk
clusters, meeting table, pantry counter), rather than being derived
from that render tree automatically. Keeping a small parallel registry
was chosen over deriving targets from mesh positions at runtime —
simpler, and sufficient for Milestone 5's NPC count. A future pass
could unify them if the furniture layout becomes more dynamic.

## Zone graph & pathfinding

`src/navigation/navigationGraph.ts`:

- `ZONE_ADJACENCY` — a hand-authored undirected graph over
  `OfficeZoneId` (the same zone ids `officeLayout.ts` already defines).
- `findZonePath(startZone, goalZone)` — BFS shortest path, pure,
  returns `null` when no path exists (the "unreachable target" case).
- `getZoneCenter(zone)` — the waypoint position for a given zone,
  derived from `ZONE_DEFINITIONS` bounds (with a hand-placed point for
  `exterior`, which has no defined AABB).

## Navigation agent

`src/navigation/NavigationAgent.ts` — a pure, timer-free state stepper:

- `createNavigationAgent(x, z, heading)` — `IDLE` agent.
- `requestPath(agent, toX, toZ)` — computes a zone-graph route via
  `computeWaypointPath` and either starts `MOVING` along it or, if no
  zone path exists, marks the agent `UNREACHABLE` (never throws,
  never silently ignores the request).
- `advanceNavigationAgent(agent, dt, speed)` — steps the agent toward
  its current waypoint; on arrival (within a small epsilon) it advances
  to the next waypoint, or to `ARRIVED` once the path is exhausted.
- `cancelPath(agent)` — returns to `IDLE`, clearing the path; a
  subsequent `requestPath` safely replaces it (this is how an NPC
  switches from "walking to my desk" to "walking to a meeting"
  mid-stride — `useNpcStore` calls `requestPath` again, which
  overwrites the in-progress path rather than requiring an explicit
  cancel first).

All of the above are exercised in `navigationGraph.test.ts` and
`NavigationAgent.test.ts`, including a mocked "no path exists" scenario
to specifically cover unreachable-target handling without needing a
genuinely disconnected zone in the real graph (the real graph is fully
connected by design — every zone in this small office should be
reachable).

## Known limitations

- NPC movement does not currently run through the player's wall
  collision resolver (`resolveWallCollisions`) — zone-graph routing
  keeps NPCs from *cross-zone* wall-crossing (they can't walk straight
  from the HR room into the meeting room, for example), but *within* a
  zone leg, movement is an unobstructed straight line. For the current
  office's open-plan zones this is visually fine; a future pass could
  apply the same collision resolver used for the player.
- No local avoidance is implemented against static furniture (desks,
  the meeting table) — only NPC-vs-NPC separation (see
  `docs/NPC_SYSTEM.md` and the local-avoidance note below).
- No true fine-grained navmesh — a target inside a room is reachable
  once the zone graph connects to that room, but there's no guarantee
  the direct-line final leg avoids furniture placed between the
  door-adjacent zone center and the exact target point. In practice
  the office's target placements were chosen with this in mind.

## Local avoidance

A lightweight nearby-agent separation was evaluated for this
milestone: with the current roster capped at 10 NPCs (Milestone 5's
`ULTRA` budget), full crowd-avoidance was judged unnecessary complexity
for the visible benefit — NPCs occasionally standing close together at
a shared point (e.g. the pantry break point, which is explicitly
`occupancyCapable: true`) reads as normal office behaviour rather than
as a bug. If the roster grows significantly in a future milestone, a
simple O(n²) nearby-pair separation check (viable at this NPC count) is
the natural next step — documented here as deliberately deferred, not
overlooked.
