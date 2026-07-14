/**
 * Arcade vehicle physics — a deliberately simple, predictable model
 * (throttle/brake/steer, no suspension or wheel slip), matching the
 * project's pure-logic-plus-tests pattern (see playerMovement.ts).
 * Heading convention matches PlayerTransform: forward = (sin h, cos h).
 */

export interface VehicleState {
  x: number;
  z: number;
  /** Yaw in radians. */
  heading: number;
  /** Signed speed in m/s (negative = reversing). */
  speed: number;
}

export interface VehicleControlInput {
  /** -1..1; positive accelerates forward, negative brakes then reverses. */
  throttle: number;
  /** -1..1; positive steers toward +heading (screen-right at neutral camera). */
  steer: number;
}

export interface VehicleSpec {
  maxForwardSpeed: number; // m/s
  maxReverseSpeed: number; // m/s (positive magnitude)
  acceleration: number; // m/s^2
  brakeDeceleration: number; // m/s^2
  /** Passive deceleration toward 0 when there is no throttle input. */
  rollingFriction: number; // m/s^2
  /** Yaw rate at full steering input and full speed. */
  turnRate: number; // rad/s
}

export const CAR_SPEC: VehicleSpec = {
  maxForwardSpeed: 16,
  maxReverseSpeed: 5,
  acceleration: 9,
  brakeDeceleration: 18,
  rollingFriction: 4,
  turnRate: 1.7,
};

export const SPORTS_CAR_SPEC: VehicleSpec = {
  maxForwardSpeed: 22,
  maxReverseSpeed: 6,
  acceleration: 13,
  brakeDeceleration: 22,
  rollingFriction: 4,
  turnRate: 2.0,
};

export const TRUCK_SPEC: VehicleSpec = {
  maxForwardSpeed: 12,
  maxReverseSpeed: 4,
  acceleration: 6,
  brakeDeceleration: 14,
  rollingFriction: 4,
  turnRate: 1.2,
};

export const MOTORCYCLE_SPEC: VehicleSpec = {
  maxForwardSpeed: 20,
  maxReverseSpeed: 3,
  acceleration: 12,
  brakeDeceleration: 20,
  rollingFriction: 4,
  turnRate: 2.4,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function stepVehicle(
  state: VehicleState,
  control: VehicleControlInput,
  spec: VehicleSpec,
  dt: number,
): VehicleState {
  const throttle = clamp(control.throttle, -1, 1);
  const steer = clamp(control.steer, -1, 1);

  let speed = state.speed;

  if (throttle > 0) {
    if (speed < 0) {
      // Braking out of reverse.
      speed = Math.min(0, speed + spec.brakeDeceleration * throttle * dt);
    } else {
      speed += spec.acceleration * throttle * dt;
    }
  } else if (throttle < 0) {
    if (speed > 0) {
      // Braking from forward motion.
      speed = Math.max(0, speed + spec.brakeDeceleration * throttle * dt);
    } else {
      speed += spec.acceleration * throttle * dt;
    }
  } else {
    // Coast: rolling friction decays speed toward zero without crossing it.
    const decay = spec.rollingFriction * dt;
    if (speed > 0) speed = Math.max(0, speed - decay);
    else if (speed < 0) speed = Math.min(0, speed + decay);
  }

  speed = clamp(speed, -spec.maxReverseSpeed, spec.maxForwardSpeed);

  // Steering authority scales with speed (no turning on the spot) and
  // flips while reversing, like a real steered axle.
  const speedFactor = clamp(Math.abs(speed) / spec.maxForwardSpeed, 0, 1);
  const direction = speed >= 0 ? 1 : -1;
  const heading = state.heading + steer * spec.turnRate * speedFactor * direction * dt;

  const x = state.x + Math.sin(heading) * speed * dt;
  const z = state.z + Math.cos(heading) * speed * dt;

  return { x, z, heading, speed };
}
