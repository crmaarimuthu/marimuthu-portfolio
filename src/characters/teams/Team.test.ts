import { describe, expect, it } from "vitest";
import { findTeamLead, getTeamMembers, hasTeamErrors, validateTeams, type NpcLike, type Team } from "./Team";

const npcs: NpcLike[] = [
  { id: "npc_lead_001", role: "TEAM_LEAD", teamId: "EMBEDDED_SYSTEMS" },
  { id: "npc_embedded_001", role: "EMBEDDED_FIRMWARE_ENGINEER", teamId: "EMBEDDED_SYSTEMS" },
  { id: "npc_embedded_002", role: "EMBEDDED_SYSTEMS_ENGINEER", teamId: "EMBEDDED_SYSTEMS" },
];

const validTeam: Team = {
  id: "EMBEDDED_SYSTEMS",
  displayName: "Embedded Systems",
  department: "Embedded Systems",
  teamLeadId: "npc_lead_001",
  memberIds: ["npc_embedded_001", "npc_embedded_002"],
  homeZone: "embeddedLab",
  meetingRoomZone: "meeting",
};

describe("validateTeams", () => {
  it("produces no errors for a well-formed team", () => {
    const diagnostics = validateTeams([validTeam], npcs);
    expect(hasTeamErrors(diagnostics)).toBe(false);
  });

  it("errors when teamLeadId references an unknown NPC", () => {
    const team: Team = { ...validTeam, teamLeadId: "npc_does_not_exist" };
    const diagnostics = validateTeams([team], npcs);
    expect(hasTeamErrors(diagnostics)).toBe(true);
  });

  it("errors when a member references an unknown NPC", () => {
    const team: Team = { ...validTeam, memberIds: ["npc_does_not_exist"] };
    const diagnostics = validateTeams([team], npcs);
    expect(hasTeamErrors(diagnostics)).toBe(true);
  });

  it("warns (does not error) on a duplicate member assignment across teams", () => {
    const teamA = validTeam;
    const teamB: Team = { ...validTeam, id: "SOFTWARE", memberIds: ["npc_embedded_001"] };
    const diagnostics = validateTeams([teamA, teamB], npcs);
    expect(diagnostics.some((d) => d.level === "WARNING")).toBe(true);
    expect(hasTeamErrors(diagnostics)).toBe(false);
  });

  it("errors when an NPC references a team that doesn't exist", () => {
    const orphanNpc: NpcLike = { id: "npc_orphan", role: "OFFICE_WORKER", teamId: "SOFTWARE" };
    const diagnostics = validateTeams([validTeam], [...npcs, orphanNpc]);
    expect(hasTeamErrors(diagnostics)).toBe(true);
  });

  it("allows a team with no team lead (e.g. LEADERSHIP)", () => {
    const leadership: Team = { ...validTeam, id: "LEADERSHIP", teamLeadId: null, memberIds: [] };
    const npcsWithNoTeamRefs = npcs.map((n) => ({ ...n, teamId: null }));
    const diagnostics = validateTeams([leadership], npcsWithNoTeamRefs);
    expect(hasTeamErrors(diagnostics)).toBe(false);
  });
});

describe("findTeamLead / getTeamMembers", () => {
  it("finds the team lead NPC", () => {
    expect(findTeamLead(validTeam, npcs)?.id).toBe("npc_lead_001");
  });

  it("returns null when the team has no lead", () => {
    const leadership: Team = { ...validTeam, teamLeadId: null };
    expect(findTeamLead(leadership, npcs)).toBeNull();
  });

  it("returns the team's member NPCs", () => {
    const members = getTeamMembers(validTeam, npcs);
    expect(members.map((m) => m.id).sort()).toEqual(["npc_embedded_001", "npc_embedded_002"]);
  });
});
