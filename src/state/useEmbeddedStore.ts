import { create } from "zustand";
import { DEMO_FIRMWARE_PROJECT, type FirmwareProject } from "@/simulations/embedded/FirmwareProject";
import {
  reduceEmbeddedTaskState,
  type EmbeddedTaskState,
} from "@/simulations/embedded/embeddedTaskState";
import {
  buildOutputLine,
  isBuildValid,
  nextBuildStage,
  validateFirmwareProject,
  type BuildDiagnostic,
  type BuildStage,
} from "@/simulations/embedded/buildSimulator";
import { createVirtualFirmwareImage, type VirtualFirmwareImage } from "@/simulations/embedded/virtualFirmwareImage";
import {
  flashOutputLine,
  isFlashValid,
  nextFlashStage,
  validateFlashTarget,
  type FlashStage,
} from "@/simulations/embedded/flashSimulator";
import { createInitialBoard, reduceBoardEvent, type VirtualBoardModel } from "@/simulations/embedded/virtualBoard";
import { configurePin, writePin, type GpioPinState } from "@/simulations/embedded/virtualGpio";
import { VirtualFirmwareRuntime } from "@/simulations/embedded/virtualFirmwareRuntime";
import { evaluateTaskSuccess } from "@/simulations/embedded/successEvaluator";
import { EMBEDDED_GPIO_ACHIEVEMENT, isAchievementUnlocked, unlockAchievement } from "@/simulations/embedded/achievement";
import { useOfficeStore } from "./useOfficeStore";

const BUILD_STAGE_DELAY_MS = 450;
const FLASH_STAGE_DELAY_MS = 450;
const CELEBRATION_DURATION_MS = 2200;

const BOARD_ID = DEMO_FIRMWARE_PROJECT.targetBoardId;
const BOARD_DISPLAY_NAME = "Virtual Embedded Board";

interface EmbeddedState {
  project: FirmwareProject;
  taskState: EmbeddedTaskState;

  buildStage: BuildStage;
  buildDiagnostics: BuildDiagnostic[];
  buildOutput: string[];
  forceBuildFailure: boolean;
  firmwareImage: VirtualFirmwareImage | null;

  flashStage: FlashStage;
  flashDiagnostics: BuildDiagnostic[];
  flashOutput: string[];

  board: VirtualBoardModel;
  observedHigh: boolean;
  observedLow: boolean;

  achievementUnlocked: boolean;
  successNotificationVisible: boolean;

  enterWorkstation: () => void;
  openProject: () => void;
  startBuild: (options?: { forceFailure?: boolean }) => void;
  retryBuild: () => void;
  prepareFlash: () => void;
  startFlash: () => void;
  retryFlash: () => void;
  prepareBoard: () => void;
  startBoard: () => void;
  dismissSuccessNotification: () => void;
  resetDemo: () => void;
  pauseRuntimeForVisibility: () => void;
  resumeRuntimeForVisibility: () => void;
}

// Side-effect resources (timers, the runtime instance) are intentionally
// kept out of Zustand state — they aren't serializable/comparable store
// data, they're singleton resources tied to the one workstation in the
// scene. See docs/EMBEDDED_SIMULATION.md "Runtime lifecycle".
let buildTimer: ReturnType<typeof setTimeout> | null = null;
let flashTimer: ReturnType<typeof setTimeout> | null = null;
let celebrationTimer: ReturnType<typeof setTimeout> | null = null;
let runtime: VirtualFirmwareRuntime | null = null;

function clearAllTimers() {
  if (buildTimer !== null) clearTimeout(buildTimer);
  if (flashTimer !== null) clearTimeout(flashTimer);
  if (celebrationTimer !== null) clearTimeout(celebrationTimer);
  buildTimer = null;
  flashTimer = null;
  celebrationTimer = null;
}

export const useEmbeddedStore = create<EmbeddedState>((set, get) => ({
  project: DEMO_FIRMWARE_PROJECT,
  taskState: "NOT_STARTED",

  buildStage: "IDLE",
  buildDiagnostics: [],
  buildOutput: [],
  forceBuildFailure: false,
  firmwareImage: null,

  flashStage: "IDLE",
  flashDiagnostics: [],
  flashOutput: [],

  board: createInitialBoard(BOARD_ID, BOARD_DISPLAY_NAME),
  observedHigh: false,
  observedLow: false,

  achievementUnlocked: isAchievementUnlocked(EMBEDDED_GPIO_ACHIEVEMENT.id),
  successNotificationVisible: false,

  enterWorkstation: () => {
    if (get().taskState !== "NOT_STARTED") return;
    set({ taskState: reduceEmbeddedTaskState(get().taskState, "ENTER_WORKSTATION") });
  },

  openProject: () => {
    if (get().taskState !== "WORKSTATION_READY") return;
    const opened = reduceEmbeddedTaskState(get().taskState, "OPEN_PROJECT");
    const withSource = reduceEmbeddedTaskState(opened, "VIEW_SOURCE");
    set({ taskState: withSource });
    useOfficeStore.getState().requestWorkAnimation("TYPE");
  },

  startBuild: (options) => {
    const state = get();
    if (state.taskState !== "SOURCE_READY") return;

    const forceBuildFailure = options?.forceFailure ?? false;
    const diagnostics = validateFirmwareProject(state.project);
    if (forceBuildFailure) {
      diagnostics.push({ level: "ERROR", message: "Simulated build failure (demo-configured)." });
    }

    set({
      taskState: reduceEmbeddedTaskState(state.taskState, "START_BUILD"),
      buildStage: "IDLE",
      buildDiagnostics: diagnostics,
      buildOutput: [],
      forceBuildFailure,
      firmwareImage: null,
    });
    useOfficeStore.getState().requestWorkAnimation("DEBUG");

    const isValid = isBuildValid(diagnostics);
    const advance = () => {
      const s = get();
      const stage = nextBuildStage(s.buildStage, isValid);
      const line = buildOutputLine(stage, s.project);
      set({ buildStage: stage, buildOutput: line ? [...s.buildOutput, line] : s.buildOutput });

      if (stage === "SUCCESS") {
        const image = createVirtualFirmwareImage(s.project, Date.now());
        set({
          firmwareImage: image,
          taskState: reduceEmbeddedTaskState(get().taskState, "BUILD_SUCCEEDED"),
        });
        return;
      }
      if (stage === "FAILED") {
        set({ taskState: reduceEmbeddedTaskState(get().taskState, "BUILD_FAILED_EVENT") });
        return;
      }
      buildTimer = setTimeout(advance, BUILD_STAGE_DELAY_MS);
    };
    buildTimer = setTimeout(advance, BUILD_STAGE_DELAY_MS);
  },

  retryBuild: () => {
    const state = get();
    if (state.taskState !== "BUILD_FAILED") return;
    set({
      taskState: reduceEmbeddedTaskState(state.taskState, "RETRY_BUILD"),
      buildStage: "IDLE",
      buildOutput: [],
      buildDiagnostics: [],
      forceBuildFailure: false,
    });
  },

  prepareFlash: () => {
    const state = get();
    if (state.taskState !== "BUILD_SUCCESS") return;
    set({ taskState: reduceEmbeddedTaskState(state.taskState, "PREPARE_FLASH") });
  },

  startFlash: () => {
    const state = get();
    if (state.taskState !== "FLASH_READY") return;

    let board = state.board;
    if (board.state === "OFF") {
      board = reduceBoardEvent(board, "POWER_ON");
    }

    const diagnostics = validateFlashTarget({
      image: state.firmwareImage,
      boardId: board.boardId,
      boardAvailable: board.state === "READY" || board.state === "PROGRAMMED",
      boardCurrentlyFlashing: board.state === "FLASHING",
    });
    const isValid = isFlashValid(diagnostics);

    board = isValid ? reduceBoardEvent(board, "BEGIN_FLASH") : board;

    set({
      board,
      taskState: reduceEmbeddedTaskState(state.taskState, "START_FLASH"),
      flashStage: "IDLE",
      flashDiagnostics: diagnostics,
      flashOutput: [],
    });
    useOfficeStore.getState().requestWorkAnimation("DEBUG");

    const advance = () => {
      const s = get();
      const stage = nextFlashStage(s.flashStage, isValid);
      const line = flashOutputLine(stage);
      set({ flashStage: stage, flashOutput: line ? [...s.flashOutput, line] : s.flashOutput });

      if (stage === "SUCCESS") {
        set({
          board: reduceBoardEvent(get().board, "FLASH_COMPLETE", { image: s.firmwareImage ?? undefined }),
          taskState: reduceEmbeddedTaskState(get().taskState, "FLASH_SUCCEEDED"),
        });
        return;
      }
      if (stage === "FAILED") {
        set({
          board: reduceBoardEvent(get().board, "FLASH_FAILED"),
          taskState: reduceEmbeddedTaskState(get().taskState, "FLASH_FAILED_EVENT"),
        });
        return;
      }
      flashTimer = setTimeout(advance, FLASH_STAGE_DELAY_MS);
    };
    flashTimer = setTimeout(advance, FLASH_STAGE_DELAY_MS);
  },

  retryFlash: () => {
    const state = get();
    if (state.taskState !== "FLASH_FAILED") return;
    set({
      taskState: reduceEmbeddedTaskState(state.taskState, "RETRY_FLASH"),
      flashStage: "IDLE",
      flashOutput: [],
      flashDiagnostics: [],
    });
  },

  prepareBoard: () => {
    const state = get();
    if (state.taskState !== "FLASH_SUCCESS") return;
    set({ taskState: reduceEmbeddedTaskState(state.taskState, "PREPARE_BOARD") });
  },

  startBoard: () => {
    const state = get();
    if (state.taskState !== "BOARD_READY" || state.board.state !== "PROGRAMMED") return;

    const behaviour = state.project.expectedBehaviour;
    const pin: GpioPinState = configurePin(behaviour.pin, "OUTPUT");
    const board = reduceBoardEvent({ ...state.board, gpio: { ...state.board.gpio, [pin.pin]: pin } }, "START");

    set({
      board,
      taskState: reduceEmbeddedTaskState(state.taskState, "START_BOARD"),
      observedHigh: false,
      observedLow: false,
    });
    useOfficeStore.getState().requestWorkAnimation("INSPECT_BOARD");

    runtime?.dispose();
    runtime = new VirtualFirmwareRuntime(behaviour, (level) => {
      const s = get();
      const currentPin = s.board.gpio[behaviour.pin];
      if (!currentPin) return;
      const updatedPin = writePin(currentPin, level);
      const nextBoard = { ...s.board, gpio: { ...s.board.gpio, [behaviour.pin]: updatedPin } };
      const observedHigh = s.observedHigh || level === "HIGH";
      const observedLow = s.observedLow || level === "LOW";
      set({ board: nextBoard, observedHigh, observedLow });
      checkTaskSuccess();
    });
    runtime.start();
  },

  dismissSuccessNotification: () => set({ successNotificationVisible: false }),

  resetDemo: () => {
    runtime?.dispose();
    runtime = null;
    clearAllTimers();

    const resumeWorkstation = useOfficeStore.getState().workstation.mode === "ACTIVE";

    set({
      taskState: "NOT_STARTED",
      buildStage: "IDLE",
      buildDiagnostics: [],
      buildOutput: [],
      forceBuildFailure: false,
      firmwareImage: null,
      flashStage: "IDLE",
      flashDiagnostics: [],
      flashOutput: [],
      board: createInitialBoard(BOARD_ID, BOARD_DISPLAY_NAME),
      observedHigh: false,
      observedLow: false,
      successNotificationVisible: false,
    });

    if (resumeWorkstation) {
      set({ taskState: reduceEmbeddedTaskState("NOT_STARTED", "ENTER_WORKSTATION") });
    }
  },

  pauseRuntimeForVisibility: () => {
    runtime?.stop();
  },
  resumeRuntimeForVisibility: () => {
    if (get().board.state === "RUNNING") {
      runtime?.start();
    }
  },
}));

function checkTaskSuccess() {
  const s = useEmbeddedStore.getState();
  if (s.taskState !== "BOARD_RUNNING") return;

  const behaviour = s.project.expectedBehaviour;
  const pin = s.board.gpio[behaviour.pin];
  const usingExpectedBehaviour = s.board.firmwareImage?.behaviourDescriptor.type === "GPIO_BLINK" &&
    s.board.firmwareImage.behaviourDescriptor.pin === behaviour.pin &&
    s.board.firmwareImage.behaviourDescriptor.intervalMs === behaviour.intervalMs;

  const success = evaluateTaskSuccess({
    buildSuccess: s.buildStage === "SUCCESS",
    flashSuccess: s.flashStage === "SUCCESS",
    boardRunning: s.board.state === "RUNNING",
    gpioDirectionCorrect: pin?.direction === "OUTPUT",
    observedHigh: s.observedHigh,
    observedLow: s.observedLow,
    usingExpectedBehaviour: !!usingExpectedBehaviour,
  });

  if (!success) return;

  useEmbeddedStore.setState({ taskState: reduceEmbeddedTaskState(s.taskState, "TASK_VERIFIED") });
  celebrate();
}

function celebrate() {
  const office = useOfficeStore.getState();
  office.requestCelebration();
  useEmbeddedStore.setState((state) => ({
    taskState: reduceEmbeddedTaskState(state.taskState, "CELEBRATE"),
    successNotificationVisible: true,
  }));
  unlockAchievement(EMBEDDED_GPIO_ACHIEVEMENT.id);
  useEmbeddedStore.setState({ achievementUnlocked: true });

  celebrationTimer = setTimeout(() => {
    useOfficeStore.getState().completeCelebration();
    useEmbeddedStore.setState((state) => ({
      taskState: reduceEmbeddedTaskState(state.taskState, "FINISH"),
    }));
  }, CELEBRATION_DURATION_MS);
}
