import type { NPCRole } from "./npcRoles";
import type { TeamId } from "../teams/Team";

/**
 * Public-safe NPC identity. Default roster (src/content/npcs.json) uses
 * entirely fictional names/identities — never real colleagues, faces,
 * employee IDs, or confidential organisational data. Real identities
 * may only be introduced through explicit user-supplied configuration.
 * See docs/PRIVACY_REVIEW.md.
 */
export interface NPCProfile {
  id: string;
  displayName: string;
  role: NPCRole;
  department: string;
  teamId: TeamId | null;
  /** Reused avatar variant key — see docs/NPC_SYSTEM.md "Avatar variation". */
  avatarVariant: string;
  workstationId: string | null;
  scheduleTemplateId: string;
  dialogueProfileId: string;
}

export interface NPCProfileDiagnostic {
  level: "ERROR" | "WARNING";
  message: string;
  npcId: string;
}

/**
 * Validates the NPC roster at startup. Never throws — one invalid NPC
 * produces diagnostics and is excluded from the active roster rather
 * than crashing the whole office simulation (see docs/NPC_SYSTEM.md
 * "Config validation").
 */
export function validateNpcProfiles(profiles: NPCProfile[]): NPCProfileDiagnostic[] {
  const diagnostics: NPCProfileDiagnostic[] = [];
  const seenIds = new Set<string>();
  const seenWorkstations = new Set<string>();

  for (const profile of profiles) {
    if (!profile.id) {
      diagnostics.push({ level: "ERROR", message: "NPC profile is missing an id.", npcId: "(unknown)" });
      continue;
    }
    if (seenIds.has(profile.id)) {
      diagnostics.push({ level: "ERROR", message: `Duplicate NPC id "${profile.id}".`, npcId: profile.id });
    }
    seenIds.add(profile.id);

    if (!profile.displayName.trim()) {
      diagnostics.push({ level: "ERROR", message: "NPC profile is missing a displayName.", npcId: profile.id });
    }

    if (profile.workstationId) {
      if (seenWorkstations.has(profile.workstationId)) {
        diagnostics.push({
          level: "ERROR",
          message: `Workstation "${profile.workstationId}" is assigned to more than one NPC.`,
          npcId: profile.id,
        });
      }
      seenWorkstations.add(profile.workstationId);
    } else {
      diagnostics.push({
        level: "WARNING",
        message: "NPC has no workstationId — it will not sit down for desk work.",
        npcId: profile.id,
      });
    }
  }

  return diagnostics;
}

export function hasProfileErrors(diagnostics: NPCProfileDiagnostic[]): boolean {
  return diagnostics.some((d) => d.level === "ERROR");
}

/** Returns only the NPCs that passed validation without an ERROR diagnostic. */
export function selectValidNpcProfiles(profiles: NPCProfile[]): NPCProfile[] {
  const diagnostics = validateNpcProfiles(profiles);
  const invalidIds = new Set(diagnostics.filter((d) => d.level === "ERROR").map((d) => d.npcId));
  return profiles.filter((p) => !invalidIds.has(p.id));
}
