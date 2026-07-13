import type { ProjectEntry } from "@/portfolio/portfolioTypes";

/**
 * No real project details (titles, responsibilities, outcomes) have
 * been supplied yet — every field below is an explicit
 * `TODO_USER_INPUT` placeholder, categorised by the domains already
 * established elsewhere in this project (embedded/communication/
 * energy-systems), so the shape is ready the moment real project
 * content is provided. Never invent project outcomes or claims — see
 * docs/PRIVACY_REVIEW.md.
 */
const TODO = "TODO_USER_INPUT";

export const PROJECTS: ProjectEntry[] = [
  {
    id: "project-embedded-1",
    title: TODO,
    category: "embedded",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "TODO_USER_INPUT",
  },
  {
    id: "project-communication-1",
    title: TODO,
    category: "communication",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "TODO_USER_INPUT",
  },
  {
    id: "project-energy-systems-1",
    title: TODO,
    category: "energy-systems",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "TODO_USER_INPUT",
  },
];
