export type WorkstationOccupancy = "AVAILABLE" | "RESERVED" | "OCCUPIED";

export interface WorkstationReservationState {
  [workstationId: string]: { occupancy: WorkstationOccupancy; occupantNpcId: string | null };
}

export function createInitialWorkstationState(workstationIds: string[]): WorkstationReservationState {
  const state: WorkstationReservationState = {};
  for (const id of workstationIds) {
    state[id] = { occupancy: "AVAILABLE", occupantNpcId: null };
  }
  return state;
}

export interface ReservationResult {
  allowed: boolean;
  reason?: "unknown-workstation" | "already-occupied" | "reserved-by-other";
  next?: WorkstationReservationState;
}

/**
 * Reserves a workstation for an NPC (the first step of "navigate ->
 * reserve -> approach -> align -> sit"). Rejects a second reservation
 * of an already RESERVED/OCCUPIED workstation — this is the "prevent
 * two NPCs from occupying the same single-seat workstation" rule.
 */
export function reserveWorkstation(
  state: WorkstationReservationState,
  workstationId: string,
  npcId: string,
): ReservationResult {
  const entry = state[workstationId];
  if (!entry) return { allowed: false, reason: "unknown-workstation" };
  if (entry.occupancy === "OCCUPIED") return { allowed: false, reason: "already-occupied" };
  if (entry.occupancy === "RESERVED" && entry.occupantNpcId !== npcId) {
    return { allowed: false, reason: "reserved-by-other" };
  }

  return {
    allowed: true,
    next: { ...state, [workstationId]: { occupancy: "RESERVED", occupantNpcId: npcId } },
  };
}

export function occupyWorkstation(
  state: WorkstationReservationState,
  workstationId: string,
  npcId: string,
): WorkstationReservationState {
  const entry = state[workstationId];
  if (!entry || entry.occupantNpcId !== npcId) return state;
  return { ...state, [workstationId]: { occupancy: "OCCUPIED", occupantNpcId: npcId } };
}

export function releaseWorkstation(
  state: WorkstationReservationState,
  workstationId: string,
  npcId: string,
): WorkstationReservationState {
  const entry = state[workstationId];
  if (!entry || entry.occupantNpcId !== npcId) return state;
  return { ...state, [workstationId]: { occupancy: "AVAILABLE", occupantNpcId: null } };
}

/**
 * The player's own configured workstation (Milestone 3/4,
 * `workplaceConfig.playerWorkstationId`) must never be assigned to an
 * NPC. Returns diagnostics rather than throwing, matching the rest of
 * the NPC config validation pipeline.
 */
export function findPlayerWorkstationConflicts(
  npcWorkstationIds: string[],
  playerWorkstationId: string,
): string[] {
  return npcWorkstationIds.filter((id) => id === playerWorkstationId);
}
