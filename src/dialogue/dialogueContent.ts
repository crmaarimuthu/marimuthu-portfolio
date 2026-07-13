import ceo from "@/content/dialogue/ceo.json";
import hr from "@/content/dialogue/hr.json";
import manager from "@/content/dialogue/manager.json";
import teamLead from "@/content/dialogue/team-lead.json";
import embeddedEngineer from "@/content/dialogue/embedded-engineer.json";
import softwareEngineer from "@/content/dialogue/software-engineer.json";
import validationEngineer from "@/content/dialogue/validation-engineer.json";
import generic from "@/content/dialogue/generic.json";
import { validateDialogueProfile, type DialogueProfile } from "./DialogueSystem";

export const DIALOGUE_PROFILES: Record<string, DialogueProfile> = {
  ceo: ceo as DialogueProfile,
  hr: hr as DialogueProfile,
  manager: manager as DialogueProfile,
  "team-lead": teamLead as DialogueProfile,
  "embedded-engineer": embeddedEngineer as DialogueProfile,
  "software-engineer": softwareEngineer as DialogueProfile,
  "validation-engineer": validationEngineer as DialogueProfile,
  generic: generic as DialogueProfile,
};

export const DIALOGUE_CONTENT_DIAGNOSTICS: string[] = Object.values(DIALOGUE_PROFILES).flatMap(
  validateDialogueProfile,
);

if (process.env.NODE_ENV !== "production") {
  for (const message of DIALOGUE_CONTENT_DIAGNOSTICS) {
    console.error(`[dialogue-content] ${message}`);
  }
}

export function getDialogueProfile(dialogueProfileId: string): DialogueProfile {
  return DIALOGUE_PROFILES[dialogueProfileId] ?? DIALOGUE_PROFILES.generic;
}
