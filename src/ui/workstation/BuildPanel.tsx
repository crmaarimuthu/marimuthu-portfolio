"use client";

import { useEmbeddedStore } from "@/state/useEmbeddedStore";
import { panelStyle, primaryButtonStyle, secondaryButtonStyle, outputLogStyle } from "./workstationStyles";

export function BuildPanel() {
  const taskState = useEmbeddedStore((s) => s.taskState);
  const buildStage = useEmbeddedStore((s) => s.buildStage);
  const buildDiagnostics = useEmbeddedStore((s) => s.buildDiagnostics);
  const buildOutput = useEmbeddedStore((s) => s.buildOutput);
  const startBuild = useEmbeddedStore((s) => s.startBuild);
  const retryBuild = useEmbeddedStore((s) => s.retryBuild);
  const prepareFlash = useEmbeddedStore((s) => s.prepareFlash);

  const canBuild = taskState === "SOURCE_READY";
  const canRetry = taskState === "BUILD_FAILED";
  const canProceed = taskState === "BUILD_SUCCESS";
  const isBuilding = taskState === "BUILDING";

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 13, letterSpacing: 0.4, opacity: 0.85 }}>BUILD (SIMULATED TOOLCHAIN)</h3>
        <span style={{ fontSize: 11, opacity: 0.6 }}>Stage: {buildStage}</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button disabled={!canBuild} onClick={() => startBuild()} style={canBuild ? primaryButtonStyle : disabledStyle}>
          {isBuilding ? "Building…" : "Build"}
        </button>
        {canRetry && (
          <button onClick={retryBuild} style={secondaryButtonStyle}>
            Retry Build
          </button>
        )}
        {canProceed && (
          <button onClick={prepareFlash} style={primaryButtonStyle}>
            Proceed to Flash
          </button>
        )}
      </div>

      {buildDiagnostics.length > 0 && (
        <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 2 }}>
          {buildDiagnostics
            .filter((d) => d.level !== "INFO")
            .map((d, i) => (
              <div key={i} style={{ color: d.level === "ERROR" ? "#ff8080" : "#e0c25c" }}>
                [{d.level}] {d.message}
              </div>
            ))}
        </div>
      )}

      <div style={outputLogStyle}>
        {buildOutput.length === 0 ? (
          <div style={{ opacity: 0.4 }}>No build output yet.</div>
        ) : (
          buildOutput.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>
    </div>
  );
}

const disabledStyle = { ...primaryButtonStyle, opacity: 0.35, cursor: "not-allowed" };
