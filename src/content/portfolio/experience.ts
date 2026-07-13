import type { ExperienceEntry } from "@/portfolio/portfolioTypes";

/**
 * No real employer/career-timeline detail has been supplied yet — see
 * docs/PRIVACY_REVIEW.md ("never invent employers, dates, or years of
 * experience"). This is a single placeholder entry establishing the
 * shape; a future content-integration milestone will replace it with
 * user-approved, public-safe detail (or leave it out entirely if the
 * user prefers not to publish a career timeline).
 */
const TODO = "TODO_USER_INPUT";

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: "experience-current",
    organization: TODO,
    title: TODO,
    startDate: TODO,
    endDate: "present",
    summary: TODO,
  },
];
