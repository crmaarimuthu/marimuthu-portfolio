import { describe, expect, it } from "vitest";
import { findZonePath } from "./navigationGraph";

describe("findZonePath", () => {
  it("returns a single-zone path when start === goal", () => {
    expect(findZonePath("engineering", "engineering")).toEqual(["engineering"]);
  });

  it("finds a direct path between adjacent zones", () => {
    expect(findZonePath("lobby", "pantry")).toEqual(["lobby", "pantry"]);
  });

  it("finds a multi-hop path through the open-plan corridor", () => {
    const path = findZonePath("hr", "executive");
    expect(path).not.toBeNull();
    expect(path![0]).toBe("hr");
    expect(path![path!.length - 1]).toBe("executive");
    expect(path!.length).toBeGreaterThan(2);
  });

  it("finds the shortest path (BFS), not just any path", () => {
    const path = findZonePath("exterior", "lobby");
    expect(path).toEqual(["exterior", "lobby"]);
  });

  it("routes from exterior into a deep enclosed room", () => {
    const path = findZonePath("exterior", "meeting");
    expect(path).not.toBeNull();
    expect(path![0]).toBe("exterior");
    expect(path![path!.length - 1]).toBe("meeting");
  });
});
