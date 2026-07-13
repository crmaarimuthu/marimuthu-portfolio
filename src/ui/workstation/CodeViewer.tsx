"use client";

import type { FirmwareSourceFile } from "@/simulations/embedded/FirmwareProject";
import { C_TOKEN_COLORS, tokenizeCLine } from "./cSyntaxHighlight";

/**
 * Read-only source viewer for the trusted demo project. No arbitrary
 * code is ever accepted from the visitor or executed — this only
 * renders fixed, bundled FirmwareProject content. See
 * docs/EMBEDDED_SIMULATION.md "Security boundary".
 */
export function CodeViewer({ file }: { file: FirmwareSourceFile }) {
  const lines = file.content.split("\n");

  return (
    <div
      style={{
        overflow: "auto",
        background: "#1e1e1e",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontSize: 13,
        lineHeight: 1.6,
        flex: 1,
        minHeight: 0,
      }}
    >
      <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#8a8a8a", fontSize: 12 }}>
        {file.path}
      </div>
      <div style={{ display: "flex", padding: "8px 0", whiteSpace: "pre" }}>
        <div style={{ padding: "0 12px", color: "#5a5a5a", userSelect: "none", textAlign: "right" }}>
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div style={{ paddingRight: 16, minWidth: 0, overflowX: "auto" }}>
          {lines.map((line, i) => (
            <div key={i}>
              {tokenizeCLine(line).map((token, j) => (
                <span key={j} style={{ color: C_TOKEN_COLORS[token.kind] }}>
                  {token.text}
                </span>
              ))}
              {line.length === 0 && " "}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
