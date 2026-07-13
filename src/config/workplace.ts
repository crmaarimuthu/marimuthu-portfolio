/**
 * Public-safe workplace configuration.
 * companyDisplayName and layout details are TODO placeholders until the
 * user explicitly supplies and approves real, public-safe values. Never
 * invent an employer name. See docs/PRIVACY_REVIEW.md.
 *
 * The office layout described by this config is a fictionalised,
 * generic professional IT/embedded office suitable for a public
 * portfolio — it is not a reproduction of any real employer's floor
 * plan.
 */
export interface WorkplaceDepartment {
  id: string;
  label: string;
}

export type OfficeRoomId =
  | "lobby"
  | "engineering"
  | "embeddedLab"
  | "meeting"
  | "executive"
  | "hr"
  | "manager"
  | "teamLead"
  | "pantry";

export interface WorkplaceConfig {
  companyDisplayName: string;
  buildingDisplayName: string;
  companyLogoAsset: string | null;
  publicDescription: string;
  buildingLabel: string;
  officeFloors: number;
  departments: WorkplaceDepartment[];
  /** Room id -> display label shown on in-world signage. */
  roomLabels: Record<OfficeRoomId, string>;
  /** Id of the desk in the engineering workspace that represents the player's own workstation. */
  playerWorkstationId: string;
}

export const workplaceConfig: WorkplaceConfig = {
  companyDisplayName: "TODO_USER_INPUT",
  buildingDisplayName: "TODO_USER_INPUT",
  companyLogoAsset: null,
  publicDescription: "TODO_USER_INPUT",
  buildingLabel: "TODO_USER_INPUT",
  officeFloors: 1,
  departments: [
    { id: "engineering", label: "Engineering" },
    { id: "embedded-lab", label: "Embedded Systems Lab" },
  ],
  roomLabels: {
    lobby: "RECEPTION",
    engineering: "ENGINEERING",
    embeddedLab: "EMBEDDED SYSTEMS LAB",
    meeting: "MEETING ROOM",
    executive: "CEO",
    hr: "HR",
    manager: "MANAGER",
    teamLead: "TEAM LEAD",
    pantry: "PANTRY",
  },
  playerWorkstationId: "desk-marimuthu",
};
