import type { GpioBlinkBehaviour } from "./FirmwareProject";
import type { GpioLevel } from "./virtualGpio";

/**
 * Safe behaviour interpreter for the trusted firmware's structured
 * `expectedBehaviour` descriptor — this is NOT a C interpreter and
 * never parses/executes the source text. It only reacts to the fixed
 * `{type: "GPIO_BLINK", pin, intervalMs}` shape already validated by
 * BuildSimulator. See docs/EMBEDDED_SIMULATION.md "Simulation boundary".
 *
 * Uses a single `setInterval`, guarded against duplicate starts —
 * calling start() while already running is a no-op, matching the
 * "prevent duplicate runtime start" requirement.
 */
export class VirtualFirmwareRuntime {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private level: GpioLevel = "LOW";

  constructor(
    private readonly behaviour: GpioBlinkBehaviour,
    private readonly onToggle: (level: GpioLevel) => void,
  ) {}

  get isRunning(): boolean {
    return this.timerId !== null;
  }

  start(): void {
    if (this.timerId !== null) return;
    this.timerId = setInterval(() => {
      this.level = this.level === "LOW" ? "HIGH" : "LOW";
      this.onToggle(this.level);
    }, this.behaviour.intervalMs);
  }

  stop(): void {
    if (this.timerId === null) return;
    clearInterval(this.timerId);
    this.timerId = null;
  }

  /** Stops the runtime and resets the tracked level to LOW (does not itself call onToggle). */
  reset(): void {
    this.stop();
    this.level = "LOW";
  }

  dispose(): void {
    this.stop();
  }
}
