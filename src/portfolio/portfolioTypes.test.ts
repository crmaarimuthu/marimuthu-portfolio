import { describe, expect, it } from "vitest";
import { hasErrors, isPlaceholder, validateProjects, validateTechStack } from "./portfolioTypes";
import type { ProjectEntry, TechStackItem } from "./portfolioTypes";

describe("isPlaceholder", () => {
  it("identifies the TODO_USER_INPUT sentinel", () => {
    expect(isPlaceholder("TODO_USER_INPUT")).toBe(true);
    expect(isPlaceholder("Real Value")).toBe(false);
  });
});

describe("validateTechStack", () => {
  it("passes for a well-formed list", () => {
    const items: TechStackItem[] = [{ id: "c", name: "C", category: "embedded" }];
    expect(hasErrors(validateTechStack(items))).toBe(false);
  });

  it("errors on a duplicate id", () => {
    const items: TechStackItem[] = [
      { id: "c", name: "C", category: "embedded" },
      { id: "c", name: "C again", category: "embedded" },
    ];
    expect(hasErrors(validateTechStack(items))).toBe(true);
  });

  it("errors on a missing name", () => {
    const items: TechStackItem[] = [{ id: "x", name: "", category: "embedded" }];
    expect(hasErrors(validateTechStack(items))).toBe(true);
  });
});

describe("validateProjects", () => {
  const base: ProjectEntry = {
    id: "p1",
    title: "Real Title",
    category: "embedded",
    summary: "s",
    responsibilities: "r",
    technologies: [],
    outcome: "o",
    status: "completed",
  };

  it("passes for a well-formed project with no placeholder title", () => {
    expect(hasErrors(validateProjects([base]))).toBe(false);
  });

  it("warns (not errors) on a placeholder title", () => {
    const diagnostics = validateProjects([{ ...base, title: "TODO_USER_INPUT" }]);
    expect(diagnostics.some((d) => d.level === "WARNING")).toBe(true);
    expect(hasErrors(diagnostics)).toBe(false);
  });

  it("errors on a duplicate project id", () => {
    const diagnostics = validateProjects([base, { ...base }]);
    expect(hasErrors(diagnostics)).toBe(true);
  });
});
