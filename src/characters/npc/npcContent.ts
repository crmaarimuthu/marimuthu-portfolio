import npcsJson from "@/content/npcs.json";
import teamsJson from "@/content/teams.json";
import { selectValidNpcProfiles, validateNpcProfiles, type NPCProfile } from "./NPCProfile";
import { validateTeams, type Team } from "../teams/Team";

const RAW_NPC_PROFILES = npcsJson as NPCProfile[];
const RAW_TEAMS = teamsJson as Team[];

export const NPC_PROFILE_DIAGNOSTICS = validateNpcProfiles(RAW_NPC_PROFILES);
export const NPC_PROFILES: NPCProfile[] = selectValidNpcProfiles(RAW_NPC_PROFILES);

export const TEAM_DIAGNOSTICS = validateTeams(
  RAW_TEAMS,
  NPC_PROFILES.map((n) => ({ id: n.id, role: n.role, teamId: n.teamId })),
);
export const TEAMS: Team[] = RAW_TEAMS;

if (process.env.NODE_ENV !== "production") {
  for (const d of [...NPC_PROFILE_DIAGNOSTICS, ...TEAM_DIAGNOSTICS]) {
    if (d.level === "ERROR") {
      console.error(`[npc-content] ${d.message}`);
    }
  }
}
