import { describe, expect, it } from "vitest";
import {
  INITIAL_CHAIR_INTERACTION_STATE,
  completeSit,
  completeStand,
  requestSit,
  requestStand,
} from "./chairState";

describe("chair sit flow", () => {
  it("allows sitting when the chair is available and the player is idle", () => {
    const result = requestSit(INITIAL_CHAIR_INTERACTION_STATE);
    expect(result.allowed).toBe(true);
    expect(result.next).toEqual({ chairState: "RESERVED", playerState: "TRANSITIONING" });
  });

  it("rejects sitting on an already-occupied chair", () => {
    const result = requestSit({ chairState: "OCCUPIED", playerState: "SEATED" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("chair-not-available");
  });

  it("rejects sitting while the player is mid-transition", () => {
    const result = requestSit({ chairState: "AVAILABLE", playerState: "TRANSITIONING" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("player-not-idle");
  });

  it("completeSit moves RESERVED/TRANSITIONING to OCCUPIED/SEATED", () => {
    const reserved = requestSit(INITIAL_CHAIR_INTERACTION_STATE).next!;
    expect(completeSit(reserved)).toEqual({ chairState: "OCCUPIED", playerState: "SEATED" });
  });

  it("completeSit is a no-op outside RESERVED/TRANSITIONING", () => {
    expect(completeSit(INITIAL_CHAIR_INTERACTION_STATE)).toEqual(INITIAL_CHAIR_INTERACTION_STATE);
  });
});

describe("chair stand flow", () => {
  const seated = { chairState: "OCCUPIED", playerState: "SEATED" } as const;

  it("allows standing when seated and the stand anchor is clear", () => {
    const result = requestStand(seated, false);
    expect(result.allowed).toBe(true);
    expect(result.next).toEqual({ chairState: "RESERVED", playerState: "TRANSITIONING" });
  });

  it("rejects standing when not seated", () => {
    const result = requestStand(INITIAL_CHAIR_INTERACTION_STATE, false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("not-seated");
  });

  it("rejects standing when the stand anchor is blocked", () => {
    const result = requestStand(seated, true);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("stand-anchor-blocked");
  });

  it("completeStand moves RESERVED/TRANSITIONING back to AVAILABLE/NORMAL", () => {
    const reserved = requestStand(seated, false).next!;
    expect(completeStand(reserved)).toEqual(INITIAL_CHAIR_INTERACTION_STATE);
  });
});
