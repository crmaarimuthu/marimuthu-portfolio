import type { NPCState } from "./npcState";

export type MeetingStatus = "SCHEDULED" | "ACTIVE" | "COMPLETE";

export interface Meeting {
  id: string;
  participantNpcIds: string[];
  roomZone: string;
  /** Navigation target ids reserved for this meeting (one per participant, or one shared point for a team discussion). */
  seatTargetIds: string[];
  startWorldMinute: number;
  durationMinutes: number;
  status: MeetingStatus;
}

const MAX_GROUP_SIZE = 6;

export function createMeeting(
  id: string,
  participantNpcIds: string[],
  roomZone: string,
  seatTargetIds: string[],
  startWorldMinute: number,
  durationMinutes: number,
): Meeting {
  return {
    id,
    participantNpcIds: limitGroupSize(participantNpcIds),
    roomZone,
    seatTargetIds,
    startWorldMinute,
    durationMinutes,
    status: "SCHEDULED",
  };
}

/** Caps meeting/discussion group size — prevents "chaotic random gatherings" per the brief. */
export function limitGroupSize(npcIds: string[], maxSize = MAX_GROUP_SIZE): string[] {
  return npcIds.slice(0, maxSize);
}

/** Excludes NPCs who can't sensibly join right now (already off-shift or already talking to the player). */
export function selectAvailableParticipants(
  candidateNpcIds: string[],
  npcStateById: Record<string, NPCState>,
): string[] {
  return candidateNpcIds.filter((id) => {
    const state = npcStateById[id];
    return state !== "OFF_DUTY" && state !== "LEAVING" && state !== "TALKING" && state !== "MEETING";
  });
}

export function isMeetingDue(meeting: Meeting, worldMinute: number): boolean {
  return meeting.status === "SCHEDULED" && worldMinute >= meeting.startWorldMinute;
}

export function isMeetingOver(meeting: Meeting, worldMinute: number): boolean {
  return meeting.status === "ACTIVE" && worldMinute >= meeting.startWorldMinute + meeting.durationMinutes;
}

export function activateMeeting(meeting: Meeting): Meeting {
  if (meeting.status !== "SCHEDULED") return meeting;
  return { ...meeting, status: "ACTIVE" };
}

export function completeMeeting(meeting: Meeting): Meeting {
  if (meeting.status !== "ACTIVE") return meeting;
  return { ...meeting, status: "COMPLETE" };
}

export interface SeatAssignmentResult {
  assignments: Record<string, string>;
  /** Participants who couldn't be given a seat (more participants than seats) — handled safely, not a crash. */
  unassignedNpcIds: string[];
}

/**
 * Assigns each participant a seat/point 1:1. If there are more
 * participants than available seats, the extras are reported as
 * unassigned rather than blocking the whole meeting — "handle missing
 * participants safely... do not block the complete office if one NPC
 * cannot reach the meeting."
 */
export function assignMeetingSeats(participantNpcIds: string[], seatTargetIds: string[]): SeatAssignmentResult {
  const assignments: Record<string, string> = {};
  const unassignedNpcIds: string[] = [];

  participantNpcIds.forEach((npcId, i) => {
    const seat = seatTargetIds[i];
    if (seat) {
      assignments[npcId] = seat;
    } else {
      unassignedNpcIds.push(npcId);
    }
  });

  return { assignments, unassignedNpcIds };
}
