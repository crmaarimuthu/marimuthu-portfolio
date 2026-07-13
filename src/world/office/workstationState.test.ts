import { describe, expect, it } from "vitest";
import {
  INITIAL_WORKSTATION_CONTEXT,
  exitWorkstation,
  requestUseWorkstation,
} from "./workstationState";

describe("workstation mode", () => {
  it("rejects USE_WORKSTATION when not seated at this workstation", () => {
    const result = requestUseWorkstation(INITIAL_WORKSTATION_CONTEXT);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("not-seated-here");
  });

  it("allows USE_WORKSTATION once seated at this workstation", () => {
    const result = requestUseWorkstation({ mode: "INACTIVE", seatedAtThisWorkstation: true });
    expect(result.allowed).toBe(true);
    expect(result.next).toEqual({ mode: "ACTIVE", seatedAtThisWorkstation: true });
  });

  it("rejects a second USE_WORKSTATION while already active", () => {
    const result = requestUseWorkstation({ mode: "ACTIVE", seatedAtThisWorkstation: true });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("already-active");
  });

  it("exitWorkstation returns to INACTIVE while keeping seated flag", () => {
    const active = { mode: "ACTIVE", seatedAtThisWorkstation: true } as const;
    expect(exitWorkstation(active)).toEqual({ mode: "INACTIVE", seatedAtThisWorkstation: true });
  });

  it("exitWorkstation is a no-op when already inactive", () => {
    expect(exitWorkstation(INITIAL_WORKSTATION_CONTEXT)).toEqual(INITIAL_WORKSTATION_CONTEXT);
  });
});
