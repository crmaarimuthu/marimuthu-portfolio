import { TECH_STACK } from "@/content/portfolio/techStack";
import { SKILLS } from "@/content/portfolio/skills";
import { PROJECTS } from "@/content/portfolio/projects";
import { EXPERIENCE } from "@/content/portfolio/experience";
import { CERTIFICATIONS } from "@/content/portfolio/certifications";
import { validateProjects, validateTechStack, type PortfolioDiagnostic } from "./portfolioTypes";

export { TECH_STACK, SKILLS, PROJECTS, EXPERIENCE, CERTIFICATIONS };

export const PORTFOLIO_CONTENT_DIAGNOSTICS: PortfolioDiagnostic[] = [
  ...validateTechStack(TECH_STACK),
  ...validateProjects(PROJECTS),
];

if (process.env.NODE_ENV !== "production") {
  for (const d of PORTFOLIO_CONTENT_DIAGNOSTICS) {
    if (d.level === "ERROR") {
      console.error(`[portfolio-content] ${d.message}`);
    }
  }
}

export function getTechStackByCategory(category: string) {
  return TECH_STACK.filter((item) => item.category === category);
}
