/**
 * Typed portfolio content model. Architecture pattern (content lives in
 * plain data files, never hardcoded inside UI components) is inspired
 * by reviewing https://github.com/prabhagaran/portfolio's structure —
 * no code, design, or personal content was copied from that repo (it
 * carries no license, so only the *pattern* — categorised, data-driven
 * content files — was reused, not its implementation or copy). All
 * facts below are either the user's own previously-supplied
 * information (name, title, the skill/protocol categories listed in
 * the original project brief) or `TODO_USER_INPUT` placeholders — see
 * docs/PRIVACY_REVIEW.md and docs/PORTFOLIO_CONTENT.md.
 */

export type PortfolioCategory =
  | "embedded"
  | "communication"
  | "energy-systems"
  | "linux-tooling";

export interface TechStackItem {
  id: string;
  name: string;
  category: PortfolioCategory;
}

export interface SkillEntry {
  id: string;
  name: string;
  category: PortfolioCategory;
  /** Free-text description of hands-on depth — left TODO until the user supplies real detail. */
  description: string;
}

export type ProjectStatus = "TODO_USER_INPUT" | "completed" | "in-progress" | "archived";

export interface ProjectEntry {
  id: string;
  title: string;
  category: PortfolioCategory | "generic";
  summary: string;
  responsibilities: string;
  technologies: string[];
  outcome: string;
  status: ProjectStatus;
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  title: string;
  /** ISO "YYYY-MM" or "TODO_USER_INPUT". */
  startDate: string;
  /** ISO "YYYY-MM", "present", or "TODO_USER_INPUT". */
  endDate: string;
  summary: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  /** ISO "YYYY-MM" or "TODO_USER_INPUT". */
  issuedDate: string;
}

export interface PortfolioDiagnostic {
  level: "ERROR" | "WARNING";
  message: string;
}

const PLACEHOLDER = "TODO_USER_INPUT";

/**
 * Flags entries that are still placeholders (informational, not an
 * error) so a future content-integration milestone (Milestone 6) can
 * see at a glance what's left to fill in — never silently ships
 * fabricated detail in place of a real placeholder.
 */
export function isPlaceholder(value: string): boolean {
  return value === PLACEHOLDER;
}

export function validateTechStack(items: TechStackItem[]): PortfolioDiagnostic[] {
  const diagnostics: PortfolioDiagnostic[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      diagnostics.push({ level: "ERROR", message: `Duplicate tech stack id "${item.id}".` });
    }
    seen.add(item.id);
    if (!item.name.trim()) {
      diagnostics.push({ level: "ERROR", message: `Tech stack item "${item.id}" is missing a name.` });
    }
  }
  return diagnostics;
}

export function validateProjects(projects: ProjectEntry[]): PortfolioDiagnostic[] {
  const diagnostics: PortfolioDiagnostic[] = [];
  const seen = new Set<string>();
  for (const project of projects) {
    if (seen.has(project.id)) {
      diagnostics.push({ level: "ERROR", message: `Duplicate project id "${project.id}".` });
    }
    seen.add(project.id);
    if (isPlaceholder(project.title)) {
      diagnostics.push({ level: "WARNING", message: `Project "${project.id}" still has a placeholder title.` });
    }
  }
  return diagnostics;
}

export function hasErrors(diagnostics: PortfolioDiagnostic[]): boolean {
  return diagnostics.some((d) => d.level === "ERROR");
}
