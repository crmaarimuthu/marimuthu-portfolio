export type WorkstationMode = "INACTIVE" | "ACTIVE";

export interface WorkstationContext {
  mode: WorkstationMode;
  /** Is the player currently seated at *this specific* workstation's chair? */
  seatedAtThisWorkstation: boolean;
}

export const INITIAL_WORKSTATION_CONTEXT: WorkstationContext = {
  mode: "INACTIVE",
  seatedAtThisWorkstation: false,
};

export interface UseWorkstationResult {
  allowed: boolean;
  reason?: "not-seated-here" | "already-active";
  next?: WorkstationContext;
}

/**
 * USE_WORKSTATION is only valid once the player is seated at the chair
 * belonging to this exact workstation (per Milestone 3 spec section 21).
 * Milestone 3 only enters/exits "workstation-ready" mode; the actual
 * build/flash/LED simulation is Milestone 4's responsibility and is
 * intentionally not implemented here.
 */
export function requestUseWorkstation(current: WorkstationContext): UseWorkstationResult {
  if (!current.seatedAtThisWorkstation) {
    return { allowed: false, reason: "not-seated-here" };
  }
  if (current.mode === "ACTIVE") {
    return { allowed: false, reason: "already-active" };
  }
  return { allowed: true, next: { ...current, mode: "ACTIVE" } };
}

export function exitWorkstation(current: WorkstationContext): WorkstationContext {
  if (current.mode !== "ACTIVE") return current;
  return { ...current, mode: "INACTIVE" };
}
