"use client";

import { useEffect, useState } from "react";

/**
 * GTA-style "mission loading" screen for the /city world: rotating
 * flavor-text tips (all describing real, already-implemented mechanics
 * of this world — the embedded workstation, dialogue, vehicles — never
 * fabricated claims) plus a progress bar. The bar's fill is a purely
 * cosmetic "perceived progress" animation (0→~92%, holding until the
 * Suspense boundary actually resolves) rather than a real byte/asset
 * counter, same convention as most game loading screens.
 */
const TIPS = [
  "Compiling embedded firmware for the CAN bus interface…",
  "Linking Modbus RTU/TCP stack…",
  "Calibrating BMS cell-balancing logic…",
  "Tip: sit at the embedded workstation to build & flash simulated firmware.",
  "Tip: press E near a teammate to start a conversation.",
  "Syncing EMS/SCADA telemetry…",
  "Tip: step outside the office to drive a vehicle around the city block.",
];

export function LoadingScreen() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        background:
          "radial-gradient(60rem 40rem at 15% -10%, rgba(76,141,255,0.16), transparent 60%)," +
          "radial-gradient(50rem 36rem at 100% 20%, rgba(255,122,41,0.14), transparent 62%), #05070a",
        color: "#edf1f6",
        fontFamily: "system-ui, sans-serif",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#4c8dff",
          borderRightColor: "#ff7a29",
          animation: "pf-loading-spin 0.9s linear infinite",
        }}
      />
      <p style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, fontFamily: "ui-monospace, monospace", margin: 0 }}>
        Entering the office&hellip;
      </p>
      <div
        style={{
          width: "min(340px, 70vw)",
          height: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg, #4c8dff, #ff7a29)",
            animation: "pf-loading-progress 2.6s cubic-bezier(0.16,0.84,0.44,1) forwards",
          }}
        />
      </div>
      <p
        key={tipIndex}
        style={{
          fontSize: 12.5,
          opacity: 0.6,
          maxWidth: 360,
          margin: 0,
          fontFamily: "ui-monospace, monospace",
          animation: "pf-loading-tip-fade 0.4s ease",
        }}
      >
        {TIPS[tipIndex]}
      </p>
      <style>{`
        @keyframes pf-loading-spin { to { transform: rotate(360deg); } }
        @keyframes pf-loading-progress { from { width: 0%; } to { width: 92%; } }
        @keyframes pf-loading-tip-fade { from { opacity: 0; } to { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
