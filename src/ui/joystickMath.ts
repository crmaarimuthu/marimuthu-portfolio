export interface JoystickVector {
  x: number;
  y: number;
}

/** Below this fraction of the max radius, output is snapped to zero. */
export const DEAD_ZONE_RATIO = 0.12;

/**
 * Converts a raw pointer delta (in pixels, from the joystick base center)
 * into a normalised [-1, 1] vector, clamped to maxRadius and zeroed
 * within the dead zone. Pure function so it is unit-testable without
 * DOM/pointer events.
 */
export function normalizeJoystickDelta(
  dx: number,
  dy: number,
  maxRadius: number,
): JoystickVector {
  const distance = Math.hypot(dx, dy);

  if (distance < maxRadius * DEAD_ZONE_RATIO) {
    return { x: 0, y: 0 };
  }

  const clampedDistance = Math.min(distance, maxRadius);
  const scale = clampedDistance / distance;
  const clampedX = dx * scale;
  const clampedY = dy * scale;

  return {
    x: clampedX / maxRadius,
    // screen Y grows downward; joystick "up" (forward) should be positive
    y: -clampedY / maxRadius,
  };
}
