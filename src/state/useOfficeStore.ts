import { create } from "zustand";
import { ENCLOSED_ROOMS, ENTRANCE_DOOR_ID, type OfficeZoneId } from "@/world/office/officeLayout";
import { reduceDoorState, type DoorEvent, type DoorState } from "@/world/office/doorState";
import {
  INITIAL_CHAIR_INTERACTION_STATE,
  completeSit,
  completeStand,
  requestSit,
  requestStand,
  type ChairInteractionState,
} from "@/world/office/chairState";
import {
  INITIAL_WORKSTATION_CONTEXT,
  exitWorkstation,
  requestUseWorkstation,
  type WorkstationContext,
} from "@/world/office/workstationState";
import {
  completeCelebrateAnimation,
  completeSitAnimation,
  completeStandAnimation,
  requestCelebrateAnimation,
  requestSitAnimation,
  requestStandAnimation,
  requestWorkActivity,
  type PlayerAnimationState,
  type WorkActivity,
} from "@/player/animationState";
import type { InteractableDescriptor } from "@/engine/interaction/InteractionSystem";

export interface PendingTransition {
  kind: "toSit" | "toStand";
  target: { x: number; z: number; heading: number };
}

interface OfficeState {
  doorStates: Record<string, DoorState>;
  chair: ChairInteractionState;
  workstation: WorkstationContext;
  zone: OfficeZoneId;
  interactionPrompt: InteractableDescriptor | null;
  playerAnimationState: PlayerAnimationState;
  pendingTransition: PendingTransition | null;

  dispatchDoorEvent: (doorId: string, event: DoorEvent) => void;
  setZone: (zone: OfficeZoneId) => void;
  setInteractionPrompt: (target: InteractableDescriptor | null) => void;

  beginSit: (target: { x: number; z: number; heading: number }) => void;
  completeSitTransition: () => void;
  beginStand: (target: { x: number; z: number; heading: number }) => void;
  completeStandTransition: () => void;
  enterWorkstation: () => void;
  exitWorkstationMode: () => void;

  /** Bridges Milestone 4 embedded-task activity into the shared player animation state machine. */
  requestWorkAnimation: (activity: WorkActivity) => void;
  requestCelebration: () => void;
  completeCelebration: () => void;
}

const initialDoorStates: Record<string, DoorState> = {
  [ENTRANCE_DOOR_ID]: "CLOSED",
};
for (const room of ENCLOSED_ROOMS) {
  initialDoorStates[room.doorId] = "CLOSED";
}

export const useOfficeStore = create<OfficeState>((set, get) => ({
  doorStates: initialDoorStates,
  chair: INITIAL_CHAIR_INTERACTION_STATE,
  workstation: INITIAL_WORKSTATION_CONTEXT,
  zone: "exterior",
  interactionPrompt: null,
  playerAnimationState: "IDLE",
  pendingTransition: null,

  dispatchDoorEvent: (doorId, event) =>
    set((state) => ({
      doorStates: {
        ...state.doorStates,
        [doorId]: reduceDoorState(state.doorStates[doorId] ?? "CLOSED", event),
      },
    })),

  setZone: (zone) => set({ zone }),
  setInteractionPrompt: (target) => set({ interactionPrompt: target }),

  beginSit: (target) => {
    const result = requestSit(get().chair);
    if (!result.allowed || !result.next) return;
    set({
      chair: result.next,
      playerAnimationState: requestSitAnimation(get().playerAnimationState),
      pendingTransition: { kind: "toSit", target },
    });
  },

  completeSitTransition: () => {
    set((state) => ({
      chair: completeSit(state.chair),
      playerAnimationState: completeSitAnimation(state.playerAnimationState),
      pendingTransition: null,
    }));
  },

  beginStand: (target) => {
    // Blocked-anchor validation happens in the caller (it needs live
    // collision data this store doesn't own); by the time beginStand is
    // called the caller has already confirmed the anchor is clear.
    const result = requestStand(get().chair, false);
    if (!result.allowed || !result.next) return;
    set((state) => ({
      chair: result.next!,
      playerAnimationState: requestStandAnimation(state.playerAnimationState),
      pendingTransition: { kind: "toStand", target },
      workstation: exitWorkstation(state.workstation),
    }));
  },

  completeStandTransition: () => {
    set((state) => ({
      chair: completeStand(state.chair),
      playerAnimationState: completeStandAnimation(state.playerAnimationState),
      pendingTransition: null,
    }));
  },

  enterWorkstation: () => {
    const seatedAtThisWorkstation = get().chair.playerState === "SEATED";
    const result = requestUseWorkstation({ ...get().workstation, seatedAtThisWorkstation });
    if (!result.allowed || !result.next) return;
    set({ workstation: result.next });
  },

  exitWorkstationMode: () => set((state) => ({ workstation: exitWorkstation(state.workstation) })),

  requestWorkAnimation: (activity) =>
    set((state) => ({ playerAnimationState: requestWorkActivity(state.playerAnimationState, activity) })),
  requestCelebration: () =>
    set((state) => ({ playerAnimationState: requestCelebrateAnimation(state.playerAnimationState) })),
  completeCelebration: () =>
    set((state) => ({ playerAnimationState: completeCelebrateAnimation(state.playerAnimationState) })),
}));
