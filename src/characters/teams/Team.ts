import type { NPCRole } from "../npc/npcRoles";

export type TeamId = "LEADERSHIP" | "PEOPLE_OPERATIONS" | "EMBEDDED_SYSTEMS" | "SOFTWARE" | "VALIDATION";

export interface Team {
  id: TeamId;
  displayName: string;
  department: string;
  /** NPC id of the team lead, if this team has one (LEADERSHIP has none — the CEO reports to no one in-world). */
  teamLeadId: string | null;
  memberIds: string[];
  homeZone: string;
  meetingRoomZone: string;
}

export interface TeamDiagnostic {
  level: "ERROR" | "WARNING";
  message: string;
}

export interface NpcLike {
  id: string;
  role: NPCRole;
  teamId: TeamId | null;
}

/**
 * Validates a team roster against the actual NPC list. Never throws —
 * returns diagnostics so one misconfigured team doesn't have to crash
 * the whole office simulation (see docs/NPC_SYSTEM.md "Config validation").
 */
export function validateTeams(teams: Team[], npcs: NpcLike[]): TeamDiagnostic[] {
  const diagnostics: TeamDiagnostic[] = [];
  const npcById = new Map(npcs.map((n) => [n.id, n]));
  const seenMemberIds = new Set<string>();

  for (const team of teams) {
    if (team.teamLeadId && !npcById.has(team.teamLeadId)) {
      diagnostics.push({
        level: "ERROR",
        message: `Team ${team.id}: teamLeadId "${team.teamLeadId}" does not reference a known NPC.`,
      });
    }

    for (const memberId of team.memberIds) {
      if (!npcById.has(memberId)) {
        diagnostics.push({
          level: "ERROR",
          message: `Team ${team.id}: member "${memberId}" does not reference a known NPC.`,
        });
        continue;
      }
      if (seenMemberIds.has(memberId)) {
        diagnostics.push({
          level: "WARNING",
          message: `NPC "${memberId}" is assigned to more than one team; the first assignment wins.`,
        });
      }
      seenMemberIds.add(memberId);
    }
  }

  for (const npc of npcs) {
    if (npc.teamId && !teams.some((t) => t.id === npc.teamId)) {
      diagnostics.push({
        level: "ERROR",
        message: `NPC "${npc.id}" references unknown team "${npc.teamId}".`,
      });
    }
  }

  return diagnostics;
}

export function hasTeamErrors(diagnostics: TeamDiagnostic[]): boolean {
  return diagnostics.some((d) => d.level === "ERROR");
}

export function findTeamLead(team: Team, npcs: NpcLike[]): NpcLike | null {
  if (!team.teamLeadId) return null;
  return npcs.find((n) => n.id === team.teamLeadId) ?? null;
}

export function getTeamMembers(team: Team, npcs: NpcLike[]): NpcLike[] {
  return npcs.filter((n) => team.memberIds.includes(n.id));
}
