import { describe, expect, it, vi } from "vitest";
import {
  advanceNavigationAgent,
  cancelPath,
  createNavigationAgent,
  requestPath,
} from "./NavigationAgent";

describe("requestPath / advanceNavigationAgent — arrival", () => {
  it("moves an agent toward a target within the same zone and arrives", () => {
    let agent = createNavigationAgent(-10, -22); // engineering zone
    agent = requestPath(agent, -8, -22); // still engineering zone
    expect(agent.status).toBe("MOVING");

    for (let i = 0; i < 50 && agent.status === "MOVING"; i++) {
      agent = advanceNavigationAgent(agent, 0.1, 2.2);
    }

    expect(agent.status).toBe("ARRIVED");
    expect(agent.x).toBeCloseTo(-8, 1);
    expect(agent.z).toBeCloseTo(-22, 1);
  });

  it("routes through an intermediate zone waypoint for a multi-zone trip", () => {
    let agent = createNavigationAgent(-10, -30.5); // hr zone
    agent = requestPath(agent, 10.5, -30.5); // executive zone
    expect(agent.status).toBe("MOVING");
    expect(agent.path.length).toBeGreaterThan(1);

    for (let i = 0; i < 500 && agent.status === "MOVING"; i++) {
      agent = advanceNavigationAgent(agent, 0.1, 2.2);
    }

    expect(agent.status).toBe("ARRIVED");
    expect(agent.x).toBeCloseTo(10.5, 0);
    expect(agent.z).toBeCloseTo(-30.5, 0);
  });
});

describe("advanceNavigationAgent — idle/arrived agents", () => {
  it("does nothing to an IDLE agent", () => {
    const agent = createNavigationAgent(0, 0);
    const result = advanceNavigationAgent(agent, 0.1, 2.2);
    expect(result).toEqual(agent);
  });
});

describe("cancelPath", () => {
  it("clears the path and returns to IDLE", () => {
    let agent = createNavigationAgent(-10, -22);
    agent = requestPath(agent, -8, -22);
    agent = cancelPath(agent);
    expect(agent.status).toBe("IDLE");
    expect(agent.path).toEqual([]);
  });

  it("a new requestPath after cancel replaces the path safely", () => {
    let agent = createNavigationAgent(-10, -22);
    agent = requestPath(agent, -8, -22);
    agent = cancelPath(agent);
    agent = requestPath(agent, -6, -22);
    expect(agent.status).toBe("MOVING");
    expect(agent.path[agent.path.length - 1]).toEqual({ x: -6, z: -22 });
  });
});

describe("unreachable target handling", () => {
  it("marks the agent UNREACHABLE when no zone path exists", async () => {
    vi.resetModules();
    vi.doMock("./navigationGraph", () => ({
      findZonePath: () => null,
      getZoneCenter: () => ({ x: 0, z: 0 }),
    }));
    const { requestPath: requestPathMocked, createNavigationAgent: createAgentMocked } = await import(
      "./NavigationAgent"
    );

    let agent = createAgentMocked(0, 0);
    agent = requestPathMocked(agent, 100, 100);
    expect(agent.status).toBe("UNREACHABLE");
    expect(agent.path).toEqual([]);

    vi.doUnmock("./navigationGraph");
    vi.resetModules();
  });
});
