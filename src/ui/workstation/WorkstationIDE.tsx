"use client";

import { useEffect, useState } from "react";
import { useEmbeddedStore } from "@/state/useEmbeddedStore";
import { useOfficeStore } from "@/state/useOfficeStore";
import type { DeviceClass } from "@/state/useAppStore";
import { CodeViewer } from "./CodeViewer";
import { BuildPanel } from "./BuildPanel";
import { FlashPanel } from "./FlashPanel";
import { BoardStatusPanel } from "./BoardStatusPanel";
import { SuccessNotification } from "./SuccessNotification";
import { primaryButtonStyle, secondaryButtonStyle } from "./workstationStyles";

type MobileTab = "CODE" | "BUILD" | "FLASH" | "BOARD";

/**
 * The embedded IDE overlay. Mounted only while
 * useOfficeStore.workstation.mode === "ACTIVE" (see Scene/Experience
 * wiring) — its own mount effect is what fires ENTER_WORKSTATION, so
 * the embedded task state machine and the office workstation mode stay
 * in lockstep without either module needing to poll the other.
 */
export function WorkstationIDE({ deviceClass }: { deviceClass: DeviceClass }) {
  const isTouchDevice = deviceClass === "MOBILE" || deviceClass === "TABLET";
  const [mobileTab, setMobileTab] = useState<MobileTab>("CODE");

  const taskState = useEmbeddedStore((s) => s.taskState);
  const project = useEmbeddedStore((s) => s.project);
  const enterWorkstation = useEmbeddedStore((s) => s.enterWorkstation);
  const openProject = useEmbeddedStore((s) => s.openProject);
  const resetDemo = useEmbeddedStore((s) => s.resetDemo);
  const startBuild = useEmbeddedStore((s) => s.startBuild);
  const startFlash = useEmbeddedStore((s) => s.startFlash);
  const startBoard = useEmbeddedStore((s) => s.startBoard);
  const exitWorkstationMode = useOfficeStore((s) => s.exitWorkstationMode);

  useEffect(() => {
    enterWorkstation();
  }, [enterWorkstation]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        exitWorkstationMode();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (taskState === "SOURCE_READY") startBuild();
        return;
      }
      if (e.key.toLowerCase() === "f" && taskState === "FLASH_READY") {
        startFlash();
        return;
      }
      if (e.key.toLowerCase() === "r" && taskState === "BOARD_READY") {
        startBoard();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [taskState, exitWorkstationMode, startBuild, startFlash, startBoard]);

  const projectOpen = taskState !== "NOT_STARTED" && taskState !== "WORKSTATION_READY";
  const sourceFile = project.sourceFiles[0];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,8,10,0.88)",
        color: "#e7ebef",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: isTouchDevice ? 10 : 24,
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{project.name}</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            {project.language} {project.standard} · VIRTUAL BOARD · SIMULATED TOOLCHAIN
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={resetDemo} style={secondaryButtonStyle}>
            Reset Demo
          </button>
          <button onClick={exitWorkstationMode} style={secondaryButtonStyle}>
            Exit (Esc)
          </button>
        </div>
      </div>

      <SuccessNotification />

      {!projectOpen ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16 }}>
          <div style={{ opacity: 0.7, fontSize: 13 }}>Embedded workstation ready.</div>
          <button onClick={openProject} style={primaryButtonStyle}>
            Open Project: {project.name}
          </button>
        </div>
      ) : isTouchDevice ? (
        <MobileLayout tab={mobileTab} setTab={setMobileTab} sourceFile={sourceFile} />
      ) : (
        <DesktopLayout sourceFile={sourceFile} />
      )}

      {!isTouchDevice && (
        <div style={{ marginTop: 10, fontSize: 10, opacity: 0.5 }}>
          Ctrl/Cmd+B build · F flash (when ready) · R run board (when ready) · Esc exit
        </div>
      )}
    </div>
  );
}

function DesktopLayout({ sourceFile }: { sourceFile: { path: string; content: string } }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, flex: 1, minHeight: 0 }}>
      <CodeViewer file={sourceFile} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <BuildPanel />
        <FlashPanel />
        <BoardStatusPanel />
      </div>
    </div>
  );
}

function MobileLayout({
  tab,
  setTab,
  sourceFile,
}: {
  tab: MobileTab;
  setTab: (t: MobileTab) => void;
  sourceFile: { path: string; content: string };
}) {
  const tabs: MobileTab[] = ["CODE", "BUILD", "FLASH", "BOARD"];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "8px 4px",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              background: tab === t ? "rgba(127,176,255,0.3)" : "rgba(255,255,255,0.05)",
              color: "#e7ebef",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {tab === "CODE" && <CodeViewer file={sourceFile} />}
        {tab === "BUILD" && <BuildPanel />}
        {tab === "FLASH" && <FlashPanel />}
        {tab === "BOARD" && <BoardStatusPanel />}
      </div>
    </div>
  );
}
