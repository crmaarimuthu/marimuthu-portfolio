import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VirtualFirmwareRuntime } from "./virtualFirmwareRuntime";

const behaviour = { type: "GPIO_BLINK" as const, pin: 5, intervalMs: 500 };

describe("VirtualFirmwareRuntime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("toggles HIGH then LOW at the configured interval", () => {
    const levels: string[] = [];
    const runtime = new VirtualFirmwareRuntime(behaviour, (level) => levels.push(level));
    runtime.start();

    vi.advanceTimersByTime(500);
    expect(levels).toEqual(["HIGH"]);
    vi.advanceTimersByTime(500);
    expect(levels).toEqual(["HIGH", "LOW"]);
    vi.advanceTimersByTime(500);
    expect(levels).toEqual(["HIGH", "LOW", "HIGH"]);

    runtime.dispose();
  });

  it("does not create a duplicate timer when start() is called twice", () => {
    const levels: string[] = [];
    const runtime = new VirtualFirmwareRuntime(behaviour, (level) => levels.push(level));
    runtime.start();
    runtime.start();

    vi.advanceTimersByTime(500);
    // If a duplicate timer had been created, this would be ["HIGH", "HIGH"].
    expect(levels).toEqual(["HIGH"]);

    runtime.dispose();
  });

  it("stop() halts further toggling", () => {
    const levels: string[] = [];
    const runtime = new VirtualFirmwareRuntime(behaviour, (level) => levels.push(level));
    runtime.start();
    vi.advanceTimersByTime(500);
    runtime.stop();
    vi.advanceTimersByTime(2000);
    expect(levels).toEqual(["HIGH"]);
    expect(runtime.isRunning).toBe(false);
  });

  it("reset() stops the runtime without emitting a toggle", () => {
    const levels: string[] = [];
    const runtime = new VirtualFirmwareRuntime(behaviour, (level) => levels.push(level));
    runtime.start();
    vi.advanceTimersByTime(500);
    runtime.reset();
    expect(levels).toEqual(["HIGH"]);
    expect(runtime.isRunning).toBe(false);
  });

  it("can be restarted cleanly after stop(), continuing to toggle (level state persists across stop/start)", () => {
    const levels: string[] = [];
    const runtime = new VirtualFirmwareRuntime(behaviour, (level) => levels.push(level));
    runtime.start();
    vi.advanceTimersByTime(500);
    runtime.stop();
    runtime.start();
    vi.advanceTimersByTime(500);
    expect(levels).toEqual(["HIGH", "LOW"]);
    runtime.dispose();
  });

  it("dispose() is idempotent and safe to call multiple times", () => {
    const runtime = new VirtualFirmwareRuntime(behaviour, () => {});
    runtime.start();
    runtime.dispose();
    expect(() => runtime.dispose()).not.toThrow();
  });
});
