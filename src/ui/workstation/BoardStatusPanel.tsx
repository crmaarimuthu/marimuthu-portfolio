"use client";

import { useEmbeddedStore } from "@/state/useEmbeddedStore";
import { panelStyle, primaryButtonStyle } from "./workstationStyles";

export function BoardStatusPanel() {
  const taskState = useEmbeddedStore((s) => s.taskState);
  const board = useEmbeddedStore((s) => s.board);
  const project = useEmbeddedStore((s) => s.project);
  const startBoard = useEmbeddedStore((s) => s.startBoard);

  const canRun = taskState === "BOARD_READY" && board.state === "PROGRAMMED";
  const pin = board.gpio[project.expectedBehaviour.pin];

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: 0, fontSize: 13, letterSpacing: 0.4, opacity: 0.85 }}>VIRTUAL BOARD STATUS</h3>

      <div style={{ fontFamily: "'Fira Code', Consolas, monospace", fontSize: 12, lineHeight: 1.8, opacity: 0.9 }}>
        <div>BOARD: {board.displayName}</div>
        <div>STATE: {board.state}</div>
        <div>FIRMWARE: {board.firmwareImage ? project.name : "(none)"}</div>
        <div>
          GPIO {project.expectedBehaviour.pin}: {pin?.level ?? "—"}
        </div>
        <div>
          LED:{" "}
          <span style={{ color: pin?.level === "HIGH" ? "#7fff9e" : "#7a7a7a", fontWeight: 700 }}>
            {pin?.level === "HIGH" ? "ON" : "OFF"}
          </span>
        </div>
        <div>INTERVAL: {project.expectedBehaviour.intervalMs} ms</div>
      </div>

      {canRun && (
        <button onClick={startBoard} style={primaryButtonStyle}>
          Run Board
        </button>
      )}

      {taskState === "BOARD_RUNNING" && (
        <div style={{ fontSize: 11, opacity: 0.7 }}>FIRMWARE SIMULATION RUNNING — VIRTUAL BOARD, no physical hardware.</div>
      )}
    </div>
  );
}
