import { describe, expect, it } from "vitest";
import {
  activateMeeting,
  assignMeetingSeats,
  completeMeeting,
  createMeeting,
  isMeetingDue,
  isMeetingOver,
  selectAvailableParticipants,
} from "./meeting";

describe("createMeeting / limitGroupSize", () => {
  it("caps the participant list to the max group size", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `npc_${i}`);
    const meeting = createMeeting("m1", ids, "meeting", ["seat-1"], 660, 30);
    expect(meeting.participantNpcIds.length).toBeLessThanOrEqual(6);
  });

  it("starts SCHEDULED", () => {
    const meeting = createMeeting("m1", ["npc_a"], "meeting", ["seat-1"], 660, 30);
    expect(meeting.status).toBe("SCHEDULED");
  });
});

describe("selectAvailableParticipants", () => {
  it("excludes OFF_DUTY, LEAVING, TALKING, and already-MEETING NPCs", () => {
    const states: Record<string, "IDLE" | "OFF_DUTY" | "LEAVING" | "TALKING" | "MEETING" | "WORKING"> = {
      npc_a: "WORKING",
      npc_b: "OFF_DUTY",
      npc_c: "LEAVING",
      npc_d: "TALKING",
      npc_e: "MEETING",
      npc_f: "IDLE",
    };
    const available = selectAvailableParticipants(Object.keys(states), states);
    expect(available.sort()).toEqual(["npc_a", "npc_f"]);
  });
});

describe("meeting lifecycle timing", () => {
  const meeting = createMeeting("m1", ["npc_a"], "meeting", ["seat-1"], 660, 30);

  it("is not due before its start time", () => {
    expect(isMeetingDue(meeting, 650)).toBe(false);
  });

  it("is due at/after its start time", () => {
    expect(isMeetingDue(meeting, 660)).toBe(true);
  });

  it("activates only from SCHEDULED", () => {
    const active = activateMeeting(meeting);
    expect(active.status).toBe("ACTIVE");
    expect(activateMeeting(active).status).toBe("ACTIVE"); // no-op, still ACTIVE
  });

  it("is over once duration has elapsed", () => {
    const active = activateMeeting(meeting);
    expect(isMeetingOver(active, 685)).toBe(false);
    expect(isMeetingOver(active, 690)).toBe(true);
  });

  it("completes only from ACTIVE", () => {
    const scheduled = createMeeting("m2", ["npc_a"], "meeting", ["seat-1"], 660, 30);
    expect(completeMeeting(scheduled).status).toBe("SCHEDULED"); // no-op
    const active = activateMeeting(scheduled);
    expect(completeMeeting(active).status).toBe("COMPLETE");
  });
});

describe("assignMeetingSeats", () => {
  it("assigns each participant a distinct seat 1:1", () => {
    const result = assignMeetingSeats(["npc_a", "npc_b"], ["seat-1", "seat-2", "seat-3"]);
    expect(result.assignments).toEqual({ npc_a: "seat-1", npc_b: "seat-2" });
    expect(result.unassignedNpcIds).toEqual([]);
  });

  it("reports unassigned participants when there are more participants than seats, without throwing", () => {
    const result = assignMeetingSeats(["npc_a", "npc_b", "npc_c"], ["seat-1"]);
    expect(result.assignments).toEqual({ npc_a: "seat-1" });
    expect(result.unassignedNpcIds).toEqual(["npc_b", "npc_c"]);
  });
});
