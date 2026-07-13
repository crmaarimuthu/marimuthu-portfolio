import type { SkillEntry } from "@/portfolio/portfolioTypes";

/**
 * Skill entries mirror the tech stack categories (techStack.ts) but add
 * a free-text depth/experience description per skill — that detail is
 * not something this project has real information for, so every
 * `description` is left as `TODO_USER_INPUT` rather than an invented
 * proficiency claim. See docs/PORTFOLIO_CONTENT.md and
 * docs/PRIVACY_REVIEW.md ("never invent qualifications, years of
 * experience, or achievements").
 */
const TODO = "TODO_USER_INPUT";

export const SKILLS: SkillEntry[] = [
  { id: "embedded-c", name: "Embedded C", category: "embedded", description: TODO },
  { id: "mcu-development", name: "MCU Development (XMC4800 / STM32)", category: "embedded", description: TODO },
  { id: "communication-protocols", name: "CAN / RS485 / Modbus / MQTT", category: "communication", description: TODO },
  { id: "energy-systems", name: "EMS / BMS / PCS", category: "energy-systems", description: TODO },
  { id: "linux-tooling", name: "Linux Build Tooling (CMake, GCC, Git)", category: "linux-tooling", description: TODO },
];
