import type { InputState } from "@/engine/input/InputManager";

export interface PlayerTransform {
  x: number;
  z: number;
  /** Yaw in radians. */
  heading: number;
}

export const WALK_SPEED = 2.2; // m/s
export const RUN_SPEED = 5.5; // m/s
export const TURN_SMOOTHING = 10; // higher = snappier

export function computeNextPlayerTransform(
  current: PlayerTransform,
  input: InputState,
  dt: number,
): PlayerTransform {
  const hasMoveInput = input.moveX !== 0 || input.moveY !== 0;
  if (!hasMoveInput) {
    return current;
  }

  const targetHeading = Math.atan2(input.moveX, input.moveY);
  const heading = dampAngle(current.heading, targetHeading, TURN_SMOOTHING, dt);

  const speed = input.running ? RUN_SPEED : WALK_SPEED;
  const magnitude = Math.min(1, Math.hypot(input.moveX, input.moveY));

  const x = current.x + Math.sin(heading) * speed * magnitude * dt;
  const z = current.z + Math.cos(heading) * speed * magnitude * dt;

  return { x, z, heading };
}

function dampAngle(current: number, target: number, smoothing: number, dt: number): number {
  let delta = target - current;
  delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
  const t = 1 - Math.exp(-smoothing * dt);
  return current + delta * t;
}
