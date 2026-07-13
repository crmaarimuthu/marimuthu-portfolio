import { profileConfig } from "@/config/profile";

export interface DialogueChoice {
  id: string;
  playerText: string;
  /** null = this choice ends the conversation. */
  nextNodeId: string | null;
}

export interface DialogueNode {
  id: string;
  npcLine: string;
  choices: DialogueChoice[];
}

export interface DialogueProfile {
  id: string;
  rootNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export function getDialogueNode(profile: DialogueProfile, nodeId: string): DialogueNode | null {
  return profile.nodes[nodeId] ?? null;
}

export interface ChoiceSelectionResult {
  nextNodeId: string | null;
  completed: boolean;
}

/**
 * Resolves a player's choice within the current node into either the
 * next node id or conversation completion. Pure/stateless — the caller
 * (useNpcStore's DialogueSession) is responsible for holding "current
 * node" as session state; this only computes the transition.
 */
export function selectDialogueChoice(
  profile: DialogueProfile,
  currentNodeId: string,
  choiceId: string,
): ChoiceSelectionResult {
  const node = getDialogueNode(profile, currentNodeId);
  const choice = node?.choices.find((c) => c.id === choiceId);
  if (!choice) return { nextNodeId: currentNodeId, completed: false };
  return { nextNodeId: choice.nextNodeId, completed: choice.nextNodeId === null };
}

/**
 * Validates a dialogue profile's internal consistency (every
 * non-terminal choice's nextNodeId must reference a real node) —
 * checked at content-load time so a typo in dialogue JSON produces a
 * diagnostic instead of a runtime crash mid-conversation.
 */
/**
 * Substitutes the small set of placeholders dialogue content is allowed
 * to reference — always pulled from existing, user-supplied profile
 * config (never invented), per "NPC dialogue may direct visitors to my
 * character introduction... consume existing profile content."
 */
export function renderDialogueText(text: string): string {
  return text
    .replaceAll("{{profileName}}", profileConfig.name)
    .replaceAll("{{profileTitle}}", profileConfig.professionalTitle);
}

export function validateDialogueProfile(profile: DialogueProfile): string[] {
  const errors: string[] = [];
  if (!profile.nodes[profile.rootNodeId]) {
    errors.push(`Dialogue profile "${profile.id}": rootNodeId "${profile.rootNodeId}" does not exist.`);
  }
  for (const node of Object.values(profile.nodes)) {
    for (const choice of node.choices) {
      if (choice.nextNodeId !== null && !profile.nodes[choice.nextNodeId]) {
        errors.push(
          `Dialogue profile "${profile.id}": node "${node.id}" choice "${choice.id}" references unknown node "${choice.nextNodeId}".`,
        );
      }
    }
  }
  return errors;
}
