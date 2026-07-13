/**
 * Typed NPC roles. Behaviour is dispatched on this enum, never on
 * fragile display-name string comparisons — see docs/NPC_SYSTEM.md.
 */
export type NPCRole =
  | "CEO"
  | "HR"
  | "MANAGER"
  | "TEAM_LEAD"
  | "EMBEDDED_FIRMWARE_ENGINEER"
  | "EMBEDDED_SYSTEMS_ENGINEER"
  | "SOFTWARE_ENGINEER"
  | "TEST_VALIDATION_ENGINEER"
  | "OFFICE_WORKER";

export interface RoleMetadata {
  role: NPCRole;
  defaultDepartment: string;
  /** Office zone this role's desk work normally happens in. */
  workZonePreference: string;
  dialogueCategory: string;
  meetingEligible: boolean;
  workstationType: "desk" | "executive-desk" | "bench";
}

export const ROLE_METADATA: Record<NPCRole, RoleMetadata> = {
  CEO: {
    role: "CEO",
    defaultDepartment: "Leadership",
    workZonePreference: "executive",
    dialogueCategory: "leadership",
    meetingEligible: true,
    workstationType: "executive-desk",
  },
  HR: {
    role: "HR",
    defaultDepartment: "People Operations",
    workZonePreference: "hr",
    dialogueCategory: "people-operations",
    meetingEligible: true,
    workstationType: "desk",
  },
  MANAGER: {
    role: "MANAGER",
    defaultDepartment: "Engineering Management",
    workZonePreference: "manager",
    dialogueCategory: "management",
    meetingEligible: true,
    workstationType: "desk",
  },
  TEAM_LEAD: {
    role: "TEAM_LEAD",
    defaultDepartment: "Engineering",
    workZonePreference: "teamLead",
    dialogueCategory: "team-lead",
    meetingEligible: true,
    workstationType: "desk",
  },
  EMBEDDED_FIRMWARE_ENGINEER: {
    role: "EMBEDDED_FIRMWARE_ENGINEER",
    defaultDepartment: "Embedded Systems",
    workZonePreference: "embeddedLab",
    dialogueCategory: "embedded-engineer",
    meetingEligible: true,
    workstationType: "bench",
  },
  EMBEDDED_SYSTEMS_ENGINEER: {
    role: "EMBEDDED_SYSTEMS_ENGINEER",
    defaultDepartment: "Embedded Systems",
    workZonePreference: "embeddedLab",
    dialogueCategory: "embedded-engineer",
    meetingEligible: true,
    workstationType: "bench",
  },
  SOFTWARE_ENGINEER: {
    role: "SOFTWARE_ENGINEER",
    defaultDepartment: "Software",
    workZonePreference: "engineering",
    dialogueCategory: "software-engineer",
    meetingEligible: true,
    workstationType: "desk",
  },
  TEST_VALIDATION_ENGINEER: {
    role: "TEST_VALIDATION_ENGINEER",
    defaultDepartment: "Validation",
    workZonePreference: "engineering",
    dialogueCategory: "validation-engineer",
    meetingEligible: true,
    workstationType: "desk",
  },
  OFFICE_WORKER: {
    role: "OFFICE_WORKER",
    defaultDepartment: "Operations",
    workZonePreference: "lobby",
    dialogueCategory: "generic",
    meetingEligible: false,
    workstationType: "desk",
  },
};

export function getRoleMetadata(role: NPCRole): RoleMetadata {
  return ROLE_METADATA[role];
}
