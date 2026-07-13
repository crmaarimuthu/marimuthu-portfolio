import { findZonePath, getZoneCenter } from "./navigationGraph";
import { resolveOfficeZone, type OfficeZoneId } from "@/world/office/officeLayout";

export interface Waypoint {
  x: number;
  z: number;
}

export type AgentNavStatus = "IDLE" | "MOVING" | "ARRIVED" | "UNREACHABLE";

export interface NavigationAgentState {
  x: number;
  z: number;
  heading: number;
  path: Waypoint[];
  pathIndex: number;
  status: AgentNavStatus;
}

export function createNavigationAgent(x: number, z: number, heading = 0): NavigationAgentState {
  return { x, z, heading, path: [], pathIndex: 0, status: "IDLE" };
}

const ARRIVAL_EPSILON = 0.15;

/**
 * Builds a zone-graph route from the agent's current position to a
 * target position, via zone centers as intermediate waypoints — see
 * docs/NAVIGATION_SYSTEM.md "Decision". Returns null (agent should be
 * marked UNREACHABLE) if no zone path exists.
 */
export function computeWaypointPath(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
): Waypoint[] | null {
  const startZone = resolveOfficeZone(fromX, fromZ);
  const goalZone = resolveOfficeZone(toX, toZ);
  const zonePath = findZonePath(startZone, goalZone);
  if (!zonePath) return null;

  const waypoints: Waypoint[] = [];
  // Skip the start zone's own center (agent is already there / en route);
  // include every intermediate zone center, then the final target point.
  for (let i = 1; i < zonePath.length; i++) {
    const zone: OfficeZoneId = zonePath[i];
    if (zone === goalZone) break;
    waypoints.push(getZoneCenter(zone));
  }
  waypoints.push({ x: toX, z: toZ });
  return waypoints;
}

/** Requests a new path, cancelling and replacing any path in progress. */
export function requestPath(agent: NavigationAgentState, toX: number, toZ: number): NavigationAgentState {
  const path = computeWaypointPath(agent.x, agent.z, toX, toZ);
  if (!path) {
    return { ...agent, path: [], pathIndex: 0, status: "UNREACHABLE" };
  }
  return { ...agent, path, pathIndex: 0, status: "MOVING" };
}

export function cancelPath(agent: NavigationAgentState): NavigationAgentState {
  return { ...agent, path: [], pathIndex: 0, status: "IDLE" };
}

/**
 * Advances the agent one frame along its current path (pure — no
 * timers, no Three.js). Handles arrival at each waypoint and at the
 * final destination.
 */
export function advanceNavigationAgent(
  agent: NavigationAgentState,
  dt: number,
  speed: number,
): NavigationAgentState {
  if (agent.status !== "MOVING" || agent.pathIndex >= agent.path.length) {
    return agent.status === "MOVING" ? { ...agent, status: "ARRIVED" } : agent;
  }

  const target = agent.path[agent.pathIndex];
  const dx = target.x - agent.x;
  const dz = target.z - agent.z;
  const distance = Math.hypot(dx, dz);

  if (distance <= ARRIVAL_EPSILON) {
    const nextIndex = agent.pathIndex + 1;
    if (nextIndex >= agent.path.length) {
      return { ...agent, x: target.x, z: target.z, pathIndex: nextIndex, status: "ARRIVED" };
    }
    return { ...agent, x: target.x, z: target.z, pathIndex: nextIndex };
  }

  const heading = Math.atan2(dx, dz);
  const step = Math.min(distance, speed * dt);
  return {
    ...agent,
    x: agent.x + (dx / distance) * step,
    z: agent.z + (dz / distance) * step,
    heading,
  };
}
