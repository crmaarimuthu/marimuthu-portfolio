import { describe, expect, it } from "vitest";
import {
  createInitialWorkstationState,
  findPlayerWorkstationConflicts,
  occupyWorkstation,
  releaseWorkstation,
  reserveWorkstation,
} from "./workstationAssignment";

describe("workstation reservation", () => {
  it("allows reserving an available workstation", () => {
    const state = createInitialWorkstationState(["desk-a"]);
    const result = reserveWorkstation(state, "desk-a", "npc_1");
    expect(result.allowed).toBe(true);
    expect(result.next?.["desk-a"]).toEqual({ occupancy: "RESERVED", occupantNpcId: "npc_1" });
  });

  it("rejects reserving an unknown workstation", () => {
    const state = createInitialWorkstationState(["desk-a"]);
    const result = reserveWorkstation(state, "desk-does-not-exist", "npc_1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("unknown-workstation");
  });

  it("rejects a duplicate reservation by a different NPC (single-seat enforcement)", () => {
    const state = createInitialWorkstationState(["desk-a"]);
    const first = reserveWorkstation(state, "desk-a", "npc_1").next!;
    const second = reserveWorkstation(first, "desk-a", "npc_2");
    expect(second.allowed).toBe(false);
    expect(second.reason).toBe("reserved-by-other");
  });

  it("rejects reserving an OCCUPIED workstation", () => {
    const state = createInitialWorkstationState(["desk-a"]);
    const reserved = reserveWorkstation(state, "desk-a", "npc_1").next!;
    const occupied = occupyWorkstation(reserved, "desk-a", "npc_1");
    const secondAttempt = reserveWorkstation(occupied, "desk-a", "npc_2");
    expect(secondAttempt.allowed).toBe(false);
    expect(secondAttempt.reason).toBe("already-occupied");
  });

  it("full reserve -> occupy -> release cycle returns to AVAILABLE", () => {
    let state = createInitialWorkstationState(["desk-a"]);
    state = reserveWorkstation(state, "desk-a", "npc_1").next!;
    state = occupyWorkstation(state, "desk-a", "npc_1");
    state = releaseWorkstation(state, "desk-a", "npc_1");
    expect(state["desk-a"]).toEqual({ occupancy: "AVAILABLE", occupantNpcId: null });
  });

  it("release is a no-op if the requesting NPC does not hold the workstation", () => {
    let state = createInitialWorkstationState(["desk-a"]);
    state = reserveWorkstation(state, "desk-a", "npc_1").next!;
    const afterWrongRelease = releaseWorkstation(state, "desk-a", "npc_2");
    expect(afterWrongRelease).toEqual(state);
  });
});

describe("findPlayerWorkstationConflicts", () => {
  it("flags an NPC workstation id that collides with the player's own", () => {
    const conflicts = findPlayerWorkstationConflicts(["desk-a", "desk-marimuthu"], "desk-marimuthu");
    expect(conflicts).toEqual(["desk-marimuthu"]);
  });

  it("returns empty when there is no collision", () => {
    const conflicts = findPlayerWorkstationConflicts(["desk-a", "desk-b"], "desk-marimuthu");
    expect(conflicts).toEqual([]);
  });
});
