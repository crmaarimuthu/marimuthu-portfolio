import type { OfficeZoneId } from "@/world/office/officeLayout";

export type NavigationTargetType =
  | "WORKSTATION"
  | "MEETING_SEAT"
  | "PANTRY_POINT"
  | "BREAK_POINT"
  | "RECEPTION_POINT"
  | "OFFICE_EXIT"
  | "TEAM_DISCUSSION_POINT";

export interface NavigationTarget {
  id: string;
  type: NavigationTargetType;
  zone: OfficeZoneId;
  x: number;
  z: number;
  heading: number;
  /** Whether more than one agent may be routed to this exact point at once. */
  occupancyCapable: boolean;
}

/**
 * Typed navigation target registry — every place an NPC can be sent is
 * declared here once, rather than raw coordinates scattered through
 * behaviour code (per docs/NAVIGATION_SYSTEM.md). Positions are
 * approximate to the furniture placed by OfficeInterior.tsx; keeping
 * this as a small parallel registry (rather than deriving it from the
 * render tree) is a documented, deliberate simplification for
 * Milestone 5 — see docs/NAVIGATION_SYSTEM.md "Known limitations".
 */
export const NAVIGATION_TARGETS: NavigationTarget[] = [
  // NPC workstations
  { id: "desk-ceo", type: "WORKSTATION", zone: "executive", x: 10.5, z: -30.5, heading: 0, occupancyCapable: false },
  { id: "desk-hr", type: "WORKSTATION", zone: "hr", x: -10.5, z: -30.5, heading: 0, occupancyCapable: false },
  { id: "desk-manager", type: "WORKSTATION", zone: "manager", x: -3.5, z: -30.5, heading: 0, occupancyCapable: false },
  { id: "desk-teamlead", type: "WORKSTATION", zone: "teamLead", x: -11, z: -19.8, heading: Math.PI, occupancyCapable: false },
  { id: "bench-embedded-1", type: "WORKSTATION", zone: "embeddedLab", x: 6.2, z: -22.5, heading: Math.PI, occupancyCapable: false },
  { id: "bench-embedded-2", type: "WORKSTATION", zone: "embeddedLab", x: 8.8, z: -25, heading: Math.PI, occupancyCapable: false },
  { id: "desk-software-1", type: "WORKSTATION", zone: "engineering", x: -11, z: -24.5, heading: 0, occupancyCapable: false },
  { id: "desk-software-2", type: "WORKSTATION", zone: "engineering", x: -9, z: -24.5, heading: 0, occupancyCapable: false },
  { id: "desk-validation-1", type: "WORKSTATION", zone: "engineering", x: -3, z: -24.5, heading: 0, occupancyCapable: false },
  { id: "desk-reception", type: "WORKSTATION", zone: "lobby", x: 0, z: -16.5, heading: Math.PI, occupancyCapable: false },

  // Meeting room seats
  { id: "meeting-seat-1", type: "MEETING_SEAT", zone: "meeting", x: 2.4, z: -30.5, heading: 0, occupancyCapable: false },
  { id: "meeting-seat-2", type: "MEETING_SEAT", zone: "meeting", x: 4.6, z: -30.5, heading: Math.PI, occupancyCapable: false },
  { id: "meeting-seat-3", type: "MEETING_SEAT", zone: "meeting", x: 3.5, z: -31.4, heading: Math.PI / 2, occupancyCapable: false },
  { id: "meeting-seat-4", type: "MEETING_SEAT", zone: "meeting", x: 3.5, z: -29.6, heading: -Math.PI / 2, occupancyCapable: false },

  // Pantry / break points
  { id: "pantry-point-1", type: "PANTRY_POINT", zone: "pantry", x: 11.6, z: -16.5, heading: 0, occupancyCapable: true },
  { id: "break-point-1", type: "BREAK_POINT", zone: "pantry", x: 11.6, z: -17.4, heading: Math.PI, occupancyCapable: true },

  // Reception / lobby
  { id: "reception-point-1", type: "RECEPTION_POINT", zone: "lobby", x: 0, z: -17.6, heading: Math.PI, occupancyCapable: true },

  // Office exit (entrance gap)
  { id: "office-exit", type: "OFFICE_EXIT", zone: "lobby", x: 0, z: -14, heading: Math.PI, occupancyCapable: true },

  // Team discussion point (near the team-lead desk cluster)
  { id: "team-discussion-1", type: "TEAM_DISCUSSION_POINT", zone: "teamLead", x: -11, z: -20.8, heading: 0, occupancyCapable: true },
];

export function findNavigationTarget(id: string): NavigationTarget | null {
  return NAVIGATION_TARGETS.find((t) => t.id === id) ?? null;
}

export function findTargetsByType(type: NavigationTargetType): NavigationTarget[] {
  return NAVIGATION_TARGETS.filter((t) => t.type === type);
}
