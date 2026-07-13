export type GpioDirection = "INPUT" | "OUTPUT";
export type GpioLevel = "LOW" | "HIGH";

export interface GpioPinState {
  pin: number;
  direction: GpioDirection;
  level: GpioLevel;
}

export function configurePin(pin: number, direction: GpioDirection): GpioPinState {
  return { pin, direction, level: "LOW" };
}

/**
 * Writes a digital level to a pin. Writes to a pin not configured as
 * OUTPUT are rejected (state is returned unchanged) — this is the
 * "GPIO direction validation" the simulation enforces, mirroring real
 * embedded GPIO semantics.
 */
export function writePin(state: GpioPinState, level: GpioLevel): GpioPinState {
  if (state.direction !== "OUTPUT") return state;
  if (state.level === level) return state;
  return { ...state, level };
}
