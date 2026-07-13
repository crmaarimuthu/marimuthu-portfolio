import { describe, expect, it } from "vitest";
import { isDoorAnimating, isDoorTraversable, reduceDoorState } from "./doorState";

describe("door state machine", () => {
  it("moves CLOSED -> OPENING -> OPEN on a full open request/animation cycle", () => {
    let state = reduceDoorState("CLOSED", "REQUEST_OPEN");
    expect(state).toBe("OPENING");
    state = reduceDoorState(state, "OPEN_ANIMATION_DONE");
    expect(state).toBe("OPEN");
  });

  it("moves OPEN -> CLOSING -> CLOSED on a full close request/animation cycle", () => {
    let state = reduceDoorState("OPEN", "REQUEST_CLOSE");
    expect(state).toBe("CLOSING");
    state = reduceDoorState(state, "CLOSE_ANIMATION_DONE");
    expect(state).toBe("CLOSED");
  });

  it("rejects REQUEST_OPEN while already OPEN", () => {
    expect(reduceDoorState("OPEN", "REQUEST_OPEN")).toBe("OPEN");
  });

  it("rejects REQUEST_CLOSE while CLOSED", () => {
    expect(reduceDoorState("CLOSED", "REQUEST_CLOSE")).toBe("CLOSED");
  });

  it("rejects REQUEST_OPEN on a LOCKED door", () => {
    expect(reduceDoorState("LOCKED", "REQUEST_OPEN")).toBe("LOCKED");
  });

  it("allows a locked door to be unlocked back to CLOSED", () => {
    expect(reduceDoorState("LOCKED", "UNLOCK")).toBe("CLOSED");
  });

  it("allows a CLOSING door to reverse into OPENING on a fresh open request", () => {
    expect(reduceDoorState("CLOSING", "REQUEST_OPEN")).toBe("OPENING");
  });

  it("ignores animation-done events fired from a non-animating state", () => {
    expect(reduceDoorState("CLOSED", "OPEN_ANIMATION_DONE")).toBe("CLOSED");
    expect(reduceDoorState("OPEN", "CLOSE_ANIMATION_DONE")).toBe("OPEN");
  });
});

describe("isDoorTraversable", () => {
  it("is only true for fully OPEN", () => {
    expect(isDoorTraversable("OPEN")).toBe(true);
    expect(isDoorTraversable("OPENING")).toBe(false);
    expect(isDoorTraversable("CLOSING")).toBe(false);
    expect(isDoorTraversable("CLOSED")).toBe(false);
    expect(isDoorTraversable("LOCKED")).toBe(false);
  });
});

describe("isDoorAnimating", () => {
  it("is true only during OPENING/CLOSING", () => {
    expect(isDoorAnimating("OPENING")).toBe(true);
    expect(isDoorAnimating("CLOSING")).toBe(true);
    expect(isDoorAnimating("OPEN")).toBe(false);
    expect(isDoorAnimating("CLOSED")).toBe(false);
    expect(isDoorAnimating("LOCKED")).toBe(false);
  });
});
