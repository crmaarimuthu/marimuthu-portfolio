/**
 * Public-safe workplace configuration.
 * companyDisplayName and layout details are TODO placeholders until the
 * user explicitly supplies and approves real, public-safe values. Never
 * invent an employer name. See docs/PRIVACY_REVIEW.md.
 */
export interface WorkplaceDepartment {
  id: string;
  label: string;
}

export interface WorkplaceConfig {
  companyDisplayName: string;
  companyLogoAsset: string | null;
  publicDescription: string;
  buildingLabel: string;
  officeFloors: number;
  departments: WorkplaceDepartment[];
}

export const workplaceConfig: WorkplaceConfig = {
  companyDisplayName: "TODO: confirm public-safe company name",
  companyLogoAsset: null,
  publicDescription: "TODO: confirm public-safe company description",
  buildingLabel: "TODO: confirm building label",
  officeFloors: 1,
  departments: [
    { id: "engineering", label: "Engineering" },
    { id: "embedded-lab", label: "Embedded Systems Lab" },
  ],
};
