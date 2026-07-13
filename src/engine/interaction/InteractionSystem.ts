export type InteractionIntent =
  | "OPEN_DOOR"
  | "CLOSE_DOOR"
  | "SIT_AT_CHAIR"
  | "STAND_FROM_CHAIR"
  | "USE_WORKSTATION"
  | "EXIT_WORKSTATION"
  | "TALK_TO_NPC";

export interface InteractableDescriptor {
  id: string;
  /** World-space X/Z position (Y ignored — selection is planar). */
  x: number;
  z: number;
  intent: InteractionIntent;
  /** Short label shown in the HUD prompt, e.g. "Open Door". */
  label: string;
  /** Maximum interaction range, in metres. */
  radius: number;
  enabled: boolean;
}

export interface PlanarTransform {
  x: number;
  z: number;
  heading: number;
}

/**
 * Interaction target selection uses proximity + a generous facing
 * tolerance (not a strict raycast): a candidate qualifies if it is
 * within `radius` AND within roughly the player's forward hemisphere
 * (dot product of facing vector and direction-to-target > threshold).
 * This keeps interaction forgiving on mobile (no precise aiming
 * required) while still preventing interacting with something directly
 * behind the player or on the far side of a wall the radius doesn't
 * reach. See docs/INTERACTION_SYSTEM.md for the rationale.
 */
const FACING_DOT_THRESHOLD = -0.2; // ~102 degrees either side of forward

export function selectBestInteractable(
  player: PlanarTransform,
  candidates: InteractableDescriptor[],
): InteractableDescriptor | null {
  const forwardX = Math.sin(player.heading);
  const forwardZ = Math.cos(player.heading);

  let best: InteractableDescriptor | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    if (!candidate.enabled) continue;

    const dx = candidate.x - player.x;
    const dz = candidate.z - player.z;
    const distance = Math.hypot(dx, dz);
    if (distance > candidate.radius) continue;

    if (distance > 1e-4) {
      const dirX = dx / distance;
      const dirZ = dz / distance;
      const facingDot = forwardX * dirX + forwardZ * dirZ;
      if (facingDot < FACING_DOT_THRESHOLD) continue;
    }

    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}
