import { create } from "zustand";
import { NPC_PROFILES } from "@/characters/npc/npcContent";
import { reduceNpcState, type NPCEvent, type NPCState } from "@/characters/npc/npcState";
import { SCHEDULE_TEMPLATES, resolveScheduleActivity, type ScheduleActivity } from "@/characters/npc/schedule";
import {
  createInitialWorkstationState,
  occupyWorkstation,
  releaseWorkstation,
  reserveWorkstation,
  type WorkstationReservationState,
} from "@/characters/npc/workstationAssignment";
import {
  advanceNavigationAgent,
  createNavigationAgent,
  requestPath,
  type NavigationAgentState,
} from "@/navigation/NavigationAgent";
import { findNavigationTarget, NAVIGATION_TARGETS } from "@/navigation/navigationTargets";
import { getDialogueProfile } from "@/dialogue/dialogueContent";
import { selectDialogueChoice } from "@/dialogue/DialogueSystem";
import { QUALITY_PROFILES, type QualityLevel } from "@/config/quality";

const WORLD_MINUTES_PER_SECOND = 2; // ~4.5 real minutes for a 09:00-18:00 day
const NPC_SPEED = 1.6; // m/s, slightly slower than the player's walk speed

export interface NpcRuntime {
  id: string;
  npcState: NPCState;
  resumeState: NPCState | null;
  agent: NavigationAgentState;
  /** Which navigation target kind the NPC is currently walking toward, if any. */
  pendingTargetId: string | null;
  breakUntilMinute: number | null;
}

interface DialogueSession {
  npcId: string;
  profileId: string;
  currentNodeId: string;
}

interface NpcState {
  worldTimeMinutes: number;
  npcs: Record<string, NpcRuntime>;
  workstations: WorkstationReservationState;
  activeNpcIds: string[];
  dialogue: DialogueSession | null;

  tick: (dt: number) => void;
  startDialogue: (npcId: string) => void;
  chooseDialogueOption: (choiceId: string) => void;
  endDialogue: () => void;
  setActiveBudget: (quality: QualityLevel) => void;
}

function initialNpcRuntime(npcId: string, spawnX: number, spawnZ: number): NpcRuntime {
  return {
    id: npcId,
    npcState: "OFF_DUTY",
    resumeState: null,
    agent: createNavigationAgent(spawnX, spawnZ),
    pendingTargetId: null,
    breakUntilMinute: null,
  };
}

function spawnPositionFor(npcId: string): { x: number; z: number } {
  const profile = NPC_PROFILES.find((p) => p.id === npcId);
  const workstation = profile?.workstationId ? findNavigationTarget(profile.workstationId) : null;
  return workstation ? { x: workstation.x, z: workstation.z } : { x: 0, z: -16 };
}

const ALL_WORKSTATION_IDS = NAVIGATION_TARGETS.filter((t) => t.type === "WORKSTATION").map((t) => t.id);

/** Picks the currently budgeted (actively simulated) subset of the roster. */
function selectActiveNpcIds(quality: QualityLevel): string[] {
  const budget = QUALITY_PROFILES[quality].npcBudget;
  return NPC_PROFILES.slice(0, budget).map((p) => p.id);
}

export const useNpcStore = create<NpcState>((set, get) => ({
  worldTimeMinutes: 9 * 60,
  npcs: Object.fromEntries(
    NPC_PROFILES.map((p) => {
      const pos = spawnPositionFor(p.id);
      return [p.id, initialNpcRuntime(p.id, pos.x, pos.z)];
    }),
  ),
  workstations: createInitialWorkstationState(ALL_WORKSTATION_IDS),
  activeNpcIds: [],
  dialogue: null,

  setActiveBudget: (quality) => set({ activeNpcIds: selectActiveNpcIds(quality) }),

  tick: (dt) => {
    const state = get();
    const worldTimeMinutes = state.worldTimeMinutes + dt * WORLD_MINUTES_PER_SECOND;

    const nextNpcs: Record<string, NpcRuntime> = { ...state.npcs };
    let workstations = state.workstations;

    for (const npcId of state.activeNpcIds) {
      const runtime = nextNpcs[npcId];
      if (!runtime || runtime.npcState === "TALKING") continue;

      const profile = NPC_PROFILES.find((p) => p.id === npcId);
      if (!profile) continue;

      const template = SCHEDULE_TEMPLATES[profile.scheduleTemplateId];
      const activity = template ? resolveScheduleActivity(template, npcId, worldTimeMinutes) : "OFF_DUTY";

      const agent = advanceNavigationAgent(runtime.agent, dt, NPC_SPEED);
      let updated: NpcRuntime = { ...runtime, agent };

      const arrivedAtPending = agent.status === "ARRIVED" && runtime.pendingTargetId !== null;

      const step = decideNpcStep(updated, activity, arrivedAtPending, worldTimeMinutes);
      if (step) {
        const result = reduceNpcState(updated.npcState, step.event, updated.resumeState);
        updated = { ...updated, npcState: result.state, resumeState: result.resumeState ?? null };

        if (step.releaseWorkstation && profile.workstationId) {
          workstations = releaseWorkstation(workstations, profile.workstationId, npcId);
        }
        if (step.reserveWorkstation && profile.workstationId) {
          const reservation = reserveWorkstation(workstations, profile.workstationId, npcId);
          if (reservation.allowed && reservation.next) workstations = reservation.next;
        }
        if (step.occupyWorkstation && profile.workstationId) {
          workstations = occupyWorkstation(workstations, profile.workstationId, npcId);
        }
        if (step.navigateToTargetId) {
          const target = findNavigationTarget(step.navigateToTargetId);
          if (target) {
            updated = { ...updated, agent: requestPath(updated.agent, target.x, target.z), pendingTargetId: step.navigateToTargetId };
          }
        } else if (step.clearPendingTarget) {
          updated = { ...updated, pendingTargetId: null };
        }
        if (step.setBreakUntil !== undefined) {
          updated = { ...updated, breakUntilMinute: step.setBreakUntil };
        }
      }

      nextNpcs[npcId] = updated;
    }

    set({ worldTimeMinutes, npcs: nextNpcs, workstations });
  },

  startDialogue: (npcId) => {
    const runtime = get().npcs[npcId];
    if (!runtime) return;
    const result = reduceNpcState(runtime.npcState, "APPROACHED_BY_PLAYER", runtime.resumeState);
    if (result.state !== "TALKING") return;

    const profile = NPC_PROFILES.find((p) => p.id === npcId);
    const dialogueProfile = getDialogueProfile(profile?.dialogueProfileId ?? "generic");

    set((s) => ({
      npcs: { ...s.npcs, [npcId]: { ...runtime, npcState: "TALKING", resumeState: result.resumeState ?? null } },
      dialogue: { npcId, profileId: dialogueProfile.id, currentNodeId: dialogueProfile.rootNodeId },
    }));
  },

  chooseDialogueOption: (choiceId) => {
    const dialogue = get().dialogue;
    if (!dialogue) return;
    const profile = getDialogueProfile(dialogue.profileId);
    const result = selectDialogueChoice(profile, dialogue.currentNodeId, choiceId);

    if (result.completed || result.nextNodeId === null) {
      get().endDialogue();
      return;
    }
    set({ dialogue: { ...dialogue, currentNodeId: result.nextNodeId } });
  },

  endDialogue: () => {
    const dialogue = get().dialogue;
    if (!dialogue) return;
    const runtime = get().npcs[dialogue.npcId];
    if (runtime) {
      const result = reduceNpcState(runtime.npcState, "DIALOGUE_ENDED", runtime.resumeState);
      set((s) => ({
        npcs: { ...s.npcs, [dialogue.npcId]: { ...runtime, npcState: result.state, resumeState: null } },
      }));
    }
    set({ dialogue: null });
  },
}));

interface NpcStep {
  event: NPCEvent;
  navigateToTargetId?: string;
  clearPendingTarget?: boolean;
  reserveWorkstation?: boolean;
  occupyWorkstation?: boolean;
  releaseWorkstation?: boolean;
  setBreakUntil?: number | undefined;
}

/**
 * Single-event-per-tick behaviour decision: given the NPC's current
 * state and the schedule-resolved activity it should be moving toward,
 * returns at most one NPCState event to apply this tick (plus any
 * navigation/workstation side effects). This is the orchestration glue
 * between the pure state machine, schedule, navigation, and workstation
 * modules — see docs/NPC_SYSTEM.md "Behaviour orchestration".
 */
function decideNpcStep(
  npc: NpcRuntime,
  activity: ScheduleActivity,
  arrivedAtPending: boolean,
  worldTimeMinutes: number,
): NpcStep | null {
  const profile = NPC_PROFILES.find((p) => p.id === npc.id);
  const workstationId = profile?.workstationId ?? null;

  if (npc.npcState === "OFF_DUTY" && activity !== "OFF_DUTY") {
    return { event: "SHIFT_STARTED" };
  }
  if (npc.npcState === "SPAWNING") {
    return { event: "SPAWNED" };
  }

  if (activity === "LEAVING" || activity === "OFF_DUTY") {
    if (["SITTING", "WORKING", "TYPING", "THINKING"].includes(npc.npcState)) {
      return { event: "LEAVE_DESK", navigateToTargetId: "office-exit", releaseWorkstation: true };
    }
    if (npc.npcState === "WALKING" && arrivedAtPending && npc.pendingTargetId === "office-exit") {
      return { event: "BEGIN_LEAVING", clearPendingTarget: true };
    }
    if (npc.npcState === "LEAVING") {
      return { event: "WENT_OFF_DUTY" };
    }
    return null;
  }

  if (activity === "MEETING" && workstationId) {
    if (["SITTING", "WORKING", "TYPING", "THINKING"].includes(npc.npcState)) {
      return { event: "LEAVE_DESK", navigateToTargetId: "team-discussion-1", releaseWorkstation: true };
    }
    if (npc.npcState === "WALKING" && arrivedAtPending && npc.pendingTargetId === "team-discussion-1") {
      return { event: "ARRIVE_AT_MEETING", clearPendingTarget: true };
    }
    if (npc.npcState === "MEETING") {
      return null; // released by the meeting lifecycle itself once its duration elapses
    }
  }

  if (activity === "BREAK") {
    if (["SITTING", "WORKING", "TYPING", "THINKING"].includes(npc.npcState)) {
      return { event: "LEAVE_DESK", navigateToTargetId: "break-point-1", releaseWorkstation: true };
    }
    if (npc.npcState === "WALKING" && arrivedAtPending && npc.pendingTargetId === "break-point-1") {
      return { event: "ARRIVE_AT_BREAK", clearPendingTarget: true, setBreakUntil: worldTimeMinutes + 15 };
    }
    if (npc.npcState === "BREAK" && npc.breakUntilMinute !== null && worldTimeMinutes >= npc.breakUntilMinute) {
      return { event: "BREAK_OVER", setBreakUntil: undefined };
    }
    return null;
  }

  // ARRIVAL / WORK — walk to the assigned workstation, sit, and cycle desk-work sub-states.
  if (workstationId) {
    if (npc.npcState === "IDLE") {
      return { event: "BEGIN_WALK", navigateToTargetId: workstationId, reserveWorkstation: true };
    }
    if (npc.npcState === "WALKING" && arrivedAtPending && npc.pendingTargetId === workstationId) {
      return { event: "ARRIVE_AT_SEAT", clearPendingTarget: true, occupyWorkstation: true };
    }
    if (npc.npcState === "WALKING" && !npc.pendingTargetId) {
      // returned from a meeting/break — head back to the desk
      return { event: "LEAVE_DESK", navigateToTargetId: workstationId, reserveWorkstation: true };
    }
    if (npc.npcState === "SITTING") {
      return { event: "BEGIN_WORK" };
    }
    if (npc.npcState === "WORKING") {
      return { event: "BEGIN_TYPING" };
    }
    if (npc.npcState === "TYPING") {
      return { event: "BEGIN_THINKING" };
    }
    if (npc.npcState === "THINKING") {
      return { event: "RESUME_TYPING" };
    }
  }

  return null;
}
