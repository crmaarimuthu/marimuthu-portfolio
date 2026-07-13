import { beforeEach, describe, expect, it } from "vitest";
import { useNpcStore } from "./useNpcStore";

function resetStore() {
  useNpcStore.setState({
    worldTimeMinutes: 9 * 60,
    dialogue: null,
  });
  // Re-seed npc runtime states to OFF_DUTY for a clean run.
  const npcs = useNpcStore.getState().npcs;
  const reset = Object.fromEntries(
    Object.entries(npcs).map(([id, npc]) => [id, { ...npc, npcState: "OFF_DUTY" as const, resumeState: null, pendingTargetId: null, breakUntilMinute: null }]),
  );
  useNpcStore.setState({ npcs: reset });
}

describe("useNpcStore — density scaling", () => {
  beforeEach(resetStore);

  it("LOW quality activates zero NPCs", () => {
    useNpcStore.getState().setActiveBudget("LOW");
    expect(useNpcStore.getState().activeNpcIds).toEqual([]);
  });

  it("MEDIUM activates up to 10 NPCs", () => {
    useNpcStore.getState().setActiveBudget("MEDIUM");
    expect(useNpcStore.getState().activeNpcIds.length).toBeLessThanOrEqual(10);
    expect(useNpcStore.getState().activeNpcIds.length).toBeGreaterThan(0);
  });

  it("ULTRA activates the full roster (bounded by actual NPC count)", () => {
    useNpcStore.getState().setActiveBudget("ULTRA");
    const totalRoster = Object.keys(useNpcStore.getState().npcs).length;
    expect(useNpcStore.getState().activeNpcIds.length).toBe(totalRoster);
  });
});

describe("useNpcStore — schedule-driven behaviour tick", () => {
  beforeEach(() => {
    resetStore();
    useNpcStore.getState().setActiveBudget("HIGH");
  });

  it("an OFF_DUTY NPC eventually starts its shift and walks toward its workstation", () => {
    const npcId = useNpcStore.getState().activeNpcIds[0];
    expect(useNpcStore.getState().npcs[npcId].npcState).toBe("OFF_DUTY");

    // Advance a handful of ticks — each tick applies at most one state
    // machine event, so multiple ticks are needed to walk the NPC
    // through SHIFT_STARTED -> SPAWNED -> BEGIN_WALK.
    for (let i = 0; i < 5; i++) {
      useNpcStore.getState().tick(1);
    }

    const state = useNpcStore.getState().npcs[npcId].npcState;
    expect(["SPAWNING", "IDLE", "WALKING", "SITTING", "WORKING", "TYPING", "THINKING"]).toContain(state);
  });

  it("advancing many ticks moves an NPC all the way to seated desk work (or the schedule's next block, e.g. a meeting)", () => {
    const npcId = useNpcStore.getState().activeNpcIds[0];
    for (let i = 0; i < 400; i++) {
      useNpcStore.getState().tick(0.5);
    }
    const state = useNpcStore.getState().npcs[npcId].npcState;
    expect(["SITTING", "WORKING", "TYPING", "THINKING", "WALKING", "MEETING"]).toContain(state);
  });
});

describe("useNpcStore — dialogue flow", () => {
  beforeEach(() => {
    resetStore();
    useNpcStore.getState().setActiveBudget("HIGH");
  });

  it("starting dialogue moves the NPC into TALKING and opens a session at the profile's root node", () => {
    const npcId = useNpcStore.getState().activeNpcIds[0];
    useNpcStore.setState((s) => ({ npcs: { ...s.npcs, [npcId]: { ...s.npcs[npcId], npcState: "WORKING" } } }));

    useNpcStore.getState().startDialogue(npcId);

    expect(useNpcStore.getState().npcs[npcId].npcState).toBe("TALKING");
    expect(useNpcStore.getState().dialogue?.npcId).toBe(npcId);
    expect(useNpcStore.getState().dialogue?.currentNodeId).toBeTruthy();
  });

  it("choosing the exit option ends the dialogue and returns the NPC to its pre-conversation state", () => {
    const npcId = useNpcStore.getState().activeNpcIds[0];
    useNpcStore.setState((s) => ({ npcs: { ...s.npcs, [npcId]: { ...s.npcs[npcId], npcState: "WORKING" } } }));
    useNpcStore.getState().startDialogue(npcId);

    useNpcStore.getState().chooseDialogueOption("exit");

    expect(useNpcStore.getState().dialogue).toBeNull();
    expect(useNpcStore.getState().npcs[npcId].npcState).toBe("WORKING");
  });

  it("endDialogue directly also restores the NPC's prior state", () => {
    const npcId = useNpcStore.getState().activeNpcIds[0];
    useNpcStore.setState((s) => ({ npcs: { ...s.npcs, [npcId]: { ...s.npcs[npcId], npcState: "TYPING" } } }));
    useNpcStore.getState().startDialogue(npcId);

    useNpcStore.getState().endDialogue();

    expect(useNpcStore.getState().npcs[npcId].npcState).toBe("TYPING");
  });

  it("does not start a dialogue with an NPC currently in a meeting", () => {
    const npcId = useNpcStore.getState().activeNpcIds[0];
    useNpcStore.setState((s) => ({ npcs: { ...s.npcs, [npcId]: { ...s.npcs[npcId], npcState: "MEETING" } } }));

    useNpcStore.getState().startDialogue(npcId);

    expect(useNpcStore.getState().dialogue).toBeNull();
    expect(useNpcStore.getState().npcs[npcId].npcState).toBe("MEETING");
  });
});
