import type { ProjectEntry } from "@/portfolio/portfolioTypes";

/**
 * The user confirmed these 8 titles as real project *domains* they've
 * worked in (matches their stated specialization list directly) and
 * asked for them to appear now, with full write-ups to follow — see
 * chat decision "Titles now, details later". Per docs/PRIVACY_REVIEW.md
 * ("never invent project outcomes or claims"), everything beyond the
 * title (summary, responsibilities, technologies, outcome, links)
 * stays an honest `TODO_USER_INPUT` / empty value until the user
 * supplies the real specifics — status "details-pending" tells the UI
 * to render a "write-up coming soon" state instead of hiding the card
 * or leaking the literal placeholder string.
 */
const TODO = "TODO_USER_INPUT";

export const PROJECTS: ProjectEntry[] = [
  {
    id: "project-bms",
    title: "Battery Management System",
    category: "energy-systems",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
  {
    id: "project-ems",
    title: "Energy Management System",
    category: "energy-systems",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
  {
    id: "project-bess",
    title: "Battery Energy Storage System",
    category: "energy-systems",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
  {
    id: "project-scada-platform",
    title: "SCADA Platform",
    category: "scada",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
  {
    id: "project-can-analyzer",
    title: "CAN Analyzer",
    category: "communication",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
  {
    id: "project-modbus-gateway",
    title: "Modbus Gateway",
    category: "communication",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
  {
    id: "project-embedded-linux-gateway",
    title: "Embedded Linux Gateway",
    category: "linux-tooling",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
  {
    id: "project-industrial-iot-gateway",
    title: "Industrial IoT Gateway",
    category: "cloud",
    summary: TODO,
    responsibilities: TODO,
    technologies: [],
    outcome: TODO,
    status: "details-pending",
  },
];
