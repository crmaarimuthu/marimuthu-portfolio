import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEmbeddedStore } from "./useEmbeddedStore";
import { useOfficeStore } from "./useOfficeStore";
import { EMBEDDED_GPIO_ACHIEVEMENT } from "@/simulations/embedded/achievement";

function resetStores() {
  useEmbeddedStore.getState().resetDemo();
  useOfficeStore.setState({
    chair: { chairState: "AVAILABLE", playerState: "NORMAL" },
    workstation: { mode: "INACTIVE", seatedAtThisWorkstation: false },
    playerAnimationState: "IDLE",
  });
  window.localStorage.clear();
  useEmbeddedStore.setState({ achievementUnlocked: false });
}

/** Runs every pending timer generation-by-generation (safe for chained setTimeout calls). */
async function flushTimers(totalMs: number, stepMs = 500) {
  for (let elapsed = 0; elapsed < totalMs; elapsed += stepMs) {
    await vi.advanceTimersByTimeAsync(stepMs);
  }
}

describe("useEmbeddedStore — full workflow integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStores();
  });
  afterEach(() => {
    useEmbeddedStore.getState().resetDemo();
    vi.useRealTimers();
  });

  it("drives NOT_STARTED all the way to COMPLETED with a build success, flash success, board running, and both HIGH/LOW observed", async () => {
    const store = useEmbeddedStore.getState();

    store.enterWorkstation();
    expect(useEmbeddedStore.getState().taskState).toBe("WORKSTATION_READY");

    store.openProject();
    expect(useEmbeddedStore.getState().taskState).toBe("SOURCE_READY");

    store.startBuild();
    expect(useEmbeddedStore.getState().taskState).toBe("BUILDING");
    await flushTimers(3000);
    expect(useEmbeddedStore.getState().taskState).toBe("BUILD_SUCCESS");
    expect(useEmbeddedStore.getState().firmwareImage).not.toBeNull();

    useEmbeddedStore.getState().prepareFlash();
    expect(useEmbeddedStore.getState().taskState).toBe("FLASH_READY");

    useEmbeddedStore.getState().startFlash();
    expect(useEmbeddedStore.getState().taskState).toBe("FLASHING");
    await flushTimers(4000);
    expect(useEmbeddedStore.getState().taskState).toBe("FLASH_SUCCESS");
    expect(useEmbeddedStore.getState().board.state).toBe("PROGRAMMED");

    useEmbeddedStore.getState().prepareBoard();
    expect(useEmbeddedStore.getState().taskState).toBe("BOARD_READY");

    useEmbeddedStore.getState().startBoard();
    expect(useEmbeddedStore.getState().taskState).toBe("BOARD_RUNNING");
    expect(useEmbeddedStore.getState().board.state).toBe("RUNNING");

    // Blink interval is 500ms; two ticks guarantees both HIGH and LOW are observed.
    await vi.advanceTimersByTimeAsync(1100);
    expect(useEmbeddedStore.getState().observedHigh).toBe(true);
    expect(useEmbeddedStore.getState().observedLow).toBe(true);
    expect(useEmbeddedStore.getState().taskState).toBe("CELEBRATING");
    expect(useEmbeddedStore.getState().successNotificationVisible).toBe(true);
    expect(useEmbeddedStore.getState().achievementUnlocked).toBe(true);

    await vi.advanceTimersByTimeAsync(2300);
    expect(useEmbeddedStore.getState().taskState).toBe("COMPLETED");
  });

  it("does not mark success immediately after START_BUILD (before the build has actually completed)", () => {
    useEmbeddedStore.getState().enterWorkstation();
    useEmbeddedStore.getState().openProject();
    useEmbeddedStore.getState().startBuild();
    expect(useEmbeddedStore.getState().taskState).toBe("BUILDING");
    expect(useEmbeddedStore.getState().taskState).not.toBe("TASK_SUCCESS");
  });

  it("a demo-configured (deterministic) build failure moves to BUILD_FAILED, and retry returns to SOURCE_READY", async () => {
    useEmbeddedStore.getState().enterWorkstation();
    useEmbeddedStore.getState().openProject();
    useEmbeddedStore.getState().startBuild({ forceFailure: true });
    await flushTimers(3000);
    expect(useEmbeddedStore.getState().taskState).toBe("BUILD_FAILED");

    useEmbeddedStore.getState().retryBuild();
    expect(useEmbeddedStore.getState().taskState).toBe("SOURCE_READY");
  });

  it("resetDemo stops the runtime, clears GPIO/board/build/flash state, but preserves an already-unlocked achievement", async () => {
    const store = useEmbeddedStore.getState();
    store.enterWorkstation();
    store.openProject();
    store.startBuild();
    await flushTimers(3000);
    useEmbeddedStore.getState().prepareFlash();
    useEmbeddedStore.getState().startFlash();
    await flushTimers(4000);
    useEmbeddedStore.getState().prepareBoard();
    useEmbeddedStore.getState().startBoard();
    await vi.advanceTimersByTimeAsync(1100);
    await vi.advanceTimersByTimeAsync(2300);
    expect(useEmbeddedStore.getState().taskState).toBe("COMPLETED");
    expect(localStorage.getItem("portfolio.achievements")).toContain(EMBEDDED_GPIO_ACHIEVEMENT.id);

    useEmbeddedStore.getState().resetDemo();
    const state = useEmbeddedStore.getState();
    expect(state.board.state).toBe("OFF");
    expect(state.board.firmwareImage).toBeNull();
    expect(state.observedHigh).toBe(false);
    expect(state.observedLow).toBe(false);
    expect(state.buildStage).toBe("IDLE");
    expect(state.flashStage).toBe("IDLE");
    // Achievement persists across reset — it's a permanent portfolio record.
    expect(state.achievementUnlocked).toBe(true);
  });
});
