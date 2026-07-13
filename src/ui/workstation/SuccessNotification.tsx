"use client";

import { useEmbeddedStore } from "@/state/useEmbeddedStore";

/** Compact, professional (non-confetti) task-complete notification. */
export function SuccessNotification() {
  const visible = useEmbeddedStore((s) => s.successNotificationVisible);
  const dismiss = useEmbeddedStore((s) => s.dismissSuccessNotification);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(20,28,22,0.92)",
        border: "1px solid rgba(127,255,158,0.5)",
        borderRadius: 8,
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "#e7ebef",
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, color: "#7fff9e" }}>
          FIRMWARE TASK COMPLETE
        </div>
        <div style={{ fontSize: 11, opacity: 0.75 }}>
          Virtual GPIO firmware built, flashed, and verified.
        </div>
      </div>
      <button
        onClick={dismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "#e7ebef",
          opacity: 0.6,
          cursor: "pointer",
          fontSize: 14,
        }}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
