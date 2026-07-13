import { describe, expect, it } from "vitest";
import { selectBestInteractable, type InteractableDescriptor } from "./InteractionSystem";

const door: InteractableDescriptor = {
  id: "door-entrance",
  x: 0,
  z: -14,
  intent: "OPEN_DOOR",
  label: "Open Door",
  radius: 2,
  enabled: true,
};

const chair: InteractableDescriptor = {
  id: "chair-desk",
  x: -10,
  z: -22,
  intent: "SIT_AT_CHAIR",
  label: "Sit",
  radius: 1.5,
  enabled: true,
};

describe("selectBestInteractable", () => {
  it("returns null when nothing is in range", () => {
    const player = { x: 0, z: 0, heading: 0 };
    expect(selectBestInteractable(player, [door, chair])).toBeNull();
  });

  it("selects a target within range and facing tolerance", () => {
    const player = { x: 0, z: -13, heading: Math.PI }; // facing -Z, toward the door
    expect(selectBestInteractable(player, [door])).toBe(door);
  });

  it("does not select a target behind the player", () => {
    const player = { x: 0, z: -13, heading: 0 }; // facing +Z, away from the door
    expect(selectBestInteractable(player, [door])).toBeNull();
  });

  it("does not select a target through a wall it can't reach (out of radius)", () => {
    const player = { x: 0, z: -50, heading: Math.PI };
    expect(selectBestInteractable(player, [door])).toBeNull();
  });

  it("prioritises the nearest of multiple valid candidates", () => {
    const nearChair: InteractableDescriptor = { ...chair, id: "near", x: 0, z: -13.5 };
    const player = { x: 0, z: -13, heading: Math.PI };
    const result = selectBestInteractable(player, [door, nearChair]);
    expect(result?.id).toBe("near");
  });

  it("ignores disabled candidates", () => {
    const player = { x: 0, z: -13, heading: Math.PI };
    expect(selectBestInteractable(player, [{ ...door, enabled: false }])).toBeNull();
  });
});
