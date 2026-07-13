"use client";

import { useEffect } from "react";
import { useNpcStore } from "@/state/useNpcStore";
import { NPC_PROFILES } from "@/characters/npc/npcContent";
import { getDialogueNode, renderDialogueText } from "@/dialogue/DialogueSystem";
import { getDialogueProfile } from "@/dialogue/dialogueContent";
import type { DeviceClass } from "@/state/useAppStore";

/**
 * Dialogue overlay (DOM, same pattern as Hud/WorkstationIDE). Mounted
 * only while useNpcStore.dialogue is non-null. Desktop: centered panel
 * with NPC name/role, line, and choice buttons. Mobile: bottom sheet
 * with large touch targets — see docs/DIALOGUE_SYSTEM.md "Mobile UI".
 */
export function DialogueUI({ deviceClass }: { deviceClass: DeviceClass }) {
  const isTouchDevice = deviceClass === "MOBILE" || deviceClass === "TABLET";
  const dialogue = useNpcStore((s) => s.dialogue);
  const chooseDialogueOption = useNpcStore((s) => s.chooseDialogueOption);
  const endDialogue = useNpcStore((s) => s.endDialogue);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") endDialogue();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [endDialogue]);

  if (!dialogue) return null;

  const profile = NPC_PROFILES.find((p) => p.id === dialogue.npcId);
  const dialogueProfile = getDialogueProfile(dialogue.profileId);
  const node = getDialogueNode(dialogueProfile, dialogue.currentNodeId);
  if (!profile || !node) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: isTouchDevice ? "flex-end" : "center",
        justifyContent: "center",
        background: "rgba(6,8,10,0.45)",
        fontFamily: "system-ui, sans-serif",
        color: "#e7ebef",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          width: isTouchDevice ? "100%" : 520,
          maxWidth: "100%",
          maxHeight: isTouchDevice ? "70vh" : "80vh",
          overflowY: "auto",
          background: "rgba(14,17,20,0.96)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: isTouchDevice ? "12px 12px 0 0" : 10,
          padding: 18,
          paddingBottom: isTouchDevice ? "max(18px, env(safe-area-inset-bottom))" : 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{profile.displayName}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>{roleLabel(profile.role)}</div>
          </div>
          <button onClick={endDialogue} style={exitButtonStyle} aria-label="Exit conversation">
            {isTouchDevice ? "Exit" : "Exit (Esc)"}
          </button>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>{renderDialogueText(node.npcLine)}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {node.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => chooseDialogueOption(choice.id)}
              style={isTouchDevice ? mobileChoiceStyle : choiceStyle}
            >
              {choice.playerText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const choiceStyle = {
  textAlign: "left" as const,
  padding: "10px 14px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.05)",
  color: "#e7ebef",
  fontSize: 13,
  cursor: "pointer",
};

const mobileChoiceStyle = {
  ...choiceStyle,
  padding: "14px 16px",
  fontSize: 14,
};

const exitButtonStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.05)",
  color: "#e7ebef",
  fontSize: 11,
  cursor: "pointer",
};
