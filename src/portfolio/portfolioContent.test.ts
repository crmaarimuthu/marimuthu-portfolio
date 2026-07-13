import { describe, expect, it } from "vitest";
import { PORTFOLIO_CONTENT_DIAGNOSTICS, TECH_STACK, getTechStackByCategory } from "./portfolioContent";

describe("bundled portfolio content", () => {
  it("produces no ERROR diagnostics for the shipped content", () => {
    expect(PORTFOLIO_CONTENT_DIAGNOSTICS.some((d) => d.level === "ERROR")).toBe(false);
  });

  it("has a non-empty tech stack", () => {
    expect(TECH_STACK.length).toBeGreaterThan(0);
  });
});

describe("getTechStackByCategory", () => {
  it("filters items by category", () => {
    const embedded = getTechStackByCategory("embedded");
    expect(embedded.length).toBeGreaterThan(0);
    expect(embedded.every((i) => i.category === "embedded")).toBe(true);
  });

  it("returns an empty array for an unknown category", () => {
    expect(getTechStackByCategory("not-a-real-category")).toEqual([]);
  });
});
