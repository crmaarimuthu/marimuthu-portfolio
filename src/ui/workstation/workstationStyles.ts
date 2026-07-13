import type { CSSProperties } from "react";

export const panelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 14,
};

export const primaryButtonStyle: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid rgba(127,176,255,0.7)",
  background: "rgba(127,176,255,0.25)",
  color: "#e7ebef",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

export const secondaryButtonStyle: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.06)",
  color: "#e7ebef",
  fontSize: 12,
  cursor: "pointer",
};

export const outputLogStyle: CSSProperties = {
  background: "#111417",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  padding: 10,
  fontFamily: "'Fira Code', Consolas, monospace",
  fontSize: 11,
  lineHeight: 1.6,
  color: "#9ad19a",
  minHeight: 60,
  maxHeight: 140,
  overflowY: "auto",
};
