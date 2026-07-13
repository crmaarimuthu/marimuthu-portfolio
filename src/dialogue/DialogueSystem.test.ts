import { describe, expect, it } from "vitest";
import { getDialogueNode, renderDialogueText, selectDialogueChoice, validateDialogueProfile, type DialogueProfile } from "./DialogueSystem";
import { DIALOGUE_PROFILES, DIALOGUE_CONTENT_DIAGNOSTICS, getDialogueProfile } from "./dialogueContent";

const testProfile: DialogueProfile = {
  id: "test",
  rootNodeId: "root",
  nodes: {
    root: {
      id: "root",
      npcLine: "Hello, {{profileName}}-adjacent greeting.",
      choices: [
        { id: "topic", playerText: "Tell me more", nextNodeId: "topic" },
        { id: "exit", playerText: "Bye", nextNodeId: null },
      ],
    },
    topic: {
      id: "topic",
      npcLine: "Here's the topic.",
      choices: [{ id: "back", playerText: "Back", nextNodeId: "root" }],
    },
  },
};

describe("getDialogueNode / selectDialogueChoice", () => {
  it("returns the root node by id", () => {
    expect(getDialogueNode(testProfile, "root")?.id).toBe("root");
  });

  it("returns null for an unknown node id", () => {
    expect(getDialogueNode(testProfile, "nope")).toBeNull();
  });

  it("moves to the next node on a valid choice", () => {
    const result = selectDialogueChoice(testProfile, "root", "topic");
    expect(result).toEqual({ nextNodeId: "topic", completed: false });
  });

  it("marks the conversation completed when the choice's nextNodeId is null", () => {
    const result = selectDialogueChoice(testProfile, "root", "exit");
    expect(result).toEqual({ nextNodeId: null, completed: true });
  });

  it("is a no-op for an unknown choice id", () => {
    const result = selectDialogueChoice(testProfile, "root", "does-not-exist");
    expect(result).toEqual({ nextNodeId: "root", completed: false });
  });

  it("can navigate back to the root and continue the conversation", () => {
    const toTopic = selectDialogueChoice(testProfile, "root", "topic");
    const backToRoot = selectDialogueChoice(testProfile, toTopic.nextNodeId!, "back");
    expect(backToRoot.nextNodeId).toBe("root");
  });
});

describe("validateDialogueProfile", () => {
  it("finds no errors in a well-formed profile", () => {
    expect(validateDialogueProfile(testProfile)).toEqual([]);
  });

  it("errors when a choice references an unknown node", () => {
    const broken: DialogueProfile = {
      ...testProfile,
      nodes: {
        ...testProfile.nodes,
        root: {
          ...testProfile.nodes.root,
          choices: [{ id: "bad", playerText: "Bad", nextNodeId: "does-not-exist" }],
        },
      },
    };
    expect(validateDialogueProfile(broken).length).toBeGreaterThan(0);
  });

  it("errors when rootNodeId does not exist", () => {
    const broken: DialogueProfile = { ...testProfile, rootNodeId: "missing" };
    expect(validateDialogueProfile(broken).length).toBeGreaterThan(0);
  });
});

describe("renderDialogueText", () => {
  it("substitutes {{profileName}} and {{profileTitle}} from profile config", () => {
    const rendered = renderDialogueText("Hi, I'm {{profileName}}, a {{profileTitle}}.");
    expect(rendered).not.toContain("{{");
    expect(rendered.length).toBeGreaterThan(0);
  });
});

describe("bundled dialogue content", () => {
  it("all shipped dialogue profiles pass validation (no broken node references)", () => {
    expect(DIALOGUE_CONTENT_DIAGNOSTICS).toEqual([]);
  });

  it("every profile referenced by an NPC dialogueProfileId exists (or falls back to generic)", () => {
    expect(getDialogueProfile("ceo").id).toBe("ceo");
    expect(getDialogueProfile("totally-unknown-profile").id).toBe("generic");
  });

  it("covers every role-relevant dialogue category from the brief", () => {
    for (const id of [
      "ceo",
      "hr",
      "manager",
      "team-lead",
      "embedded-engineer",
      "software-engineer",
      "validation-engineer",
      "generic",
    ]) {
      expect(DIALOGUE_PROFILES[id]).toBeDefined();
    }
  });
});
