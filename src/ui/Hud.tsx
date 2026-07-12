"use client";

import type { CSSProperties } from "react";
import type { InputManager } from "@/engine/input/InputManager";
import type { DeviceClass } from "@/state/useAppStore";
import { VirtualJoystick } from "./VirtualJoystick";

export function Hud({
  inputManager,
  deviceClass,
}: {
  inputManager: InputManager;
  deviceClass: DeviceClass;
}) {
  const isTouchDevice = deviceClass === "MOBILE" || deviceClass === "TABLET";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "system-ui, sans-serif",
        color: "#e7ebef",
      }}
    >
      {!isTouchDevice && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            fontSize: 12,
            opacity: 0.7,
            lineHeight: 1.6,
          }}
        >
          <div>WASD move &middot; Shift run &middot; E interact &middot; F sit/stand</div>
        </div>
      )}

      {isTouchDevice && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            pointerEvents: "auto",
          }}
        >
          <VirtualJoystick onChange={(x, y) => inputManager.setJoystick(x, y)} />
        </div>
      )}

      {isTouchDevice && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            display: "flex",
            gap: 12,
            pointerEvents: "auto",
          }}
        >
          <button
            onPointerDown={() => inputManager.setMobileRunning(true)}
            onPointerUp={() => inputManager.setMobileRunning(false)}
            style={buttonStyle}
          >
            Run
          </button>
          <button onPointerDown={() => inputManager.triggerInteract()} style={buttonStyle}>
            Interact
          </button>
          <button onPointerDown={() => inputManager.triggerSitToggle()} style={buttonStyle}>
            Sit
          </button>
        </div>
      )}
    </div>
  );
}

const buttonStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "#e7ebef",
  fontSize: 12,
  touchAction: "none",
};
