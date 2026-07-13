import { describe, expect, it } from "vitest";
import { isNpcTransitionAllowed, reduceNpcState } from "./npcState";

describe("NPC state machine — core flow", () => {
  it("SPAWNING -> IDLE -> WALKING -> SITTING -> WORKING -> TYPING -> THINKING -> TYPING", () => {
    let result = reduceNpcState("SPAWNING", "SPAWNED", null);
    expect(result.state).toBe("IDLE");
    result = reduceNpcState(result.state, "BEGIN_WALK", null);
    expect(result.state).toBe("WALKING");
    result = reduceNpcState(result.state, "ARRIVE_AT_SEAT", null);
    expect(result.state).toBe("SITTING");
    result = reduceNpcState(result.state, "BEGIN_WORK", null);
    expect(result.state).toBe("WORKING");
    result = reduceNpcState(result.state, "BEGIN_TYPING", null);
    expect(result.state).toBe("TYPING");
    result = reduceNpcState(result.state, "BEGIN_THINKING", null);
    expect(result.state).toBe("THINKING");
    result = reduceNpcState(result.state, "RESUME_TYPING", null);
    expect(result.state).toBe("TYPING");
  });

  it("WORKING -> WALKING -> MEETING -> WALKING", () => {
    let result = reduceNpcState("WORKING", "LEAVE_DESK", null);
    expect(result.state).toBe("WALKING");
    result = reduceNpcState(result.state, "ARRIVE_AT_MEETING", null);
    expect(result.state).toBe("MEETING");
    result = reduceNpcState(result.state, "MEETING_OVER", null);
    expect(result.state).toBe("WALKING");
  });

  it("WORKING -> WALKING -> BREAK -> WALKING", () => {
    let result = reduceNpcState("WORKING", "LEAVE_DESK", null);
    result = reduceNpcState(result.state, "ARRIVE_AT_BREAK", null);
    expect(result.state).toBe("BREAK");
    result = reduceNpcState(result.state, "BREAK_OVER", null);
    expect(result.state).toBe("WALKING");
  });

  it("LEAVING -> OFF_DUTY -> SPAWNING on next shift", () => {
    let result = reduceNpcState("WALKING", "BEGIN_LEAVING", null);
    expect(result.state).toBe("LEAVING");
    result = reduceNpcState(result.state, "WENT_OFF_DUTY", null);
    expect(result.state).toBe("OFF_DUTY");
    result = reduceNpcState(result.state, "SHIFT_STARTED", null);
    expect(result.state).toBe("SPAWNING");
  });
});

describe("NPC state machine — invalid transitions", () => {
  it("rejects BEGIN_WORK from IDLE (must walk and sit first)", () => {
    const result = reduceNpcState("IDLE", "BEGIN_WORK", null);
    expect(result.state).toBe("IDLE");
  });

  it("rejects ARRIVE_AT_SEAT from IDLE", () => {
    expect(reduceNpcState("IDLE", "ARRIVE_AT_SEAT", null).state).toBe("IDLE");
  });

  it("isNpcTransitionAllowed matches reducer behaviour", () => {
    expect(isNpcTransitionAllowed("SITTING", "BEGIN_WORK")).toBe(true);
    expect(isNpcTransitionAllowed("SITTING", "ARRIVE_AT_MEETING")).toBe(false);
  });
});

describe("NPC state machine — TALKING interruption and resume", () => {
  it("interrupts WORKING and resumes WORKING after DIALOGUE_ENDED", () => {
    const talking = reduceNpcState("WORKING", "APPROACHED_BY_PLAYER", null);
    expect(talking.state).toBe("TALKING");
    expect(talking.resumeState).toBe("WORKING");

    const resumed = reduceNpcState(talking.state, "DIALOGUE_ENDED", talking.resumeState ?? null);
    expect(resumed.state).toBe("WORKING");
  });

  it("interrupts TYPING and resumes TYPING", () => {
    const talking = reduceNpcState("TYPING", "APPROACHED_BY_PLAYER", null);
    expect(talking.resumeState).toBe("TYPING");
    const resumed = reduceNpcState("TALKING", "DIALOGUE_ENDED", talking.resumeState ?? null);
    expect(resumed.state).toBe("TYPING");
  });

  it("does not interrupt MEETING", () => {
    const result = reduceNpcState("MEETING", "APPROACHED_BY_PLAYER", null);
    expect(result.state).toBe("MEETING");
  });

  it("does not interrupt LEAVING", () => {
    const result = reduceNpcState("LEAVING", "APPROACHED_BY_PLAYER", null);
    expect(result.state).toBe("LEAVING");
  });

  it("does not stack a second TALKING session while already talking", () => {
    const result = reduceNpcState("TALKING", "APPROACHED_BY_PLAYER", "WORKING");
    expect(result.state).toBe("TALKING");
    expect(result.resumeState).toBe("WORKING");
  });

  it("DIALOGUE_ENDED falls back to IDLE when no resume state was recorded", () => {
    const result = reduceNpcState("TALKING", "DIALOGUE_ENDED", null);
    expect(result.state).toBe("IDLE");
  });

  it("DIALOGUE_ENDED is a no-op outside TALKING", () => {
    const result = reduceNpcState("WORKING", "DIALOGUE_ENDED", null);
    expect(result.state).toBe("WORKING");
  });
});
