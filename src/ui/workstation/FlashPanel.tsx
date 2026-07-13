"use client";

import { useEmbeddedStore } from "@/state/useEmbeddedStore";
import { panelStyle, primaryButtonStyle, secondaryButtonStyle, outputLogStyle } from "./workstationStyles";

export function FlashPanel() {
  const taskState = useEmbeddedStore((s) => s.taskState);
  const flashStage = useEmbeddedStore((s) => s.flashStage);
  const flashDiagnostics = useEmbeddedStore((s) => s.flashDiagnostics);
  const flashOutput = useEmbeddedStore((s) => s.flashOutput);
  const startFlash = useEmbeddedStore((s) => s.startFlash);
  const retryFlash = useEmbeddedStore((s) => s.retryFlash);
  const prepareBoard = useEmbeddedStore((s) => s.prepareBoard);

  const canFlash = taskState === "FLASH_READY";
  const canRetry = taskState === "FLASH_FAILED";
  const canProceed = taskState === "FLASH_SUCCESS";
  const isFlashing = taskState === "FLASHING";

  const disabled = !canFlash;

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 13, letterSpacing: 0.4, opacity: 0.85 }}>FLASH (VIRTUAL DEBUG INTERFACE)</h3>
        <span style={{ fontSize: 11, opacity: 0.6 }}>Stage: {flashStage}</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={disabled}
          onClick={startFlash}
          style={disabled ? { ...primaryButtonStyle, opacity: 0.35, cursor: "not-allowed" } : primaryButtonStyle}
        >
          {isFlashing ? "Flashing…" : "Flash"}
        </button>
        {canRetry && (
          <button onClick={retryFlash} style={secondaryButtonStyle}>
            Retry Flash
          </button>
        )}
        {canProceed && (
          <button onClick={prepareBoard} style={primaryButtonStyle}>
            Prepare Board
          </button>
        )}
      </div>

      {flashDiagnostics.length > 0 && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 2 }}>
          {flashDiagnostics
            .filter((d) => d.level !== "INFO")
            .map((d, i) => (
              <div key={i} style={{ color: d.level === "ERROR" ? "#ff8080" : "#e0c25c" }}>
                [{d.level}] {d.message}
              </div>
            ))}
        </div>
      )}

      <div style={outputLogStyle}>
        {flashOutput.length === 0 ? (
          <div style={{ opacity: 0.4 }}>No flash output yet.</div>
        ) : (
          flashOutput.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>
    </div>
  );
}
