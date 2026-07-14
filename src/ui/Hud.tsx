"use client";

import type { CSSProperties } from "react";
import type { InputManager } from "@/engine/input/InputManager";
import type { DeviceClass } from "@/state/useAppStore";
import { useOfficeStore } from "@/state/useOfficeStore";
import { useNpcStore } from "@/state/useNpcStore";
import { useVehicleStore } from "@/state/useVehicleStore";
import { VirtualJoystick } from "./VirtualJoystick";
import { TouchLookArea } from "./TouchLookArea";

const INTENT_MOBILE_LABEL: Record<string, string> = {
  OPEN_DOOR: "OPEN",
  CLOSE_DOOR: "CLOSE",
  SIT_AT_CHAIR: "SIT",
  USE_WORKSTATION: "USE",
  EXIT_WORKSTATION: "EXIT",
  STAND_FROM_CHAIR: "STAND",
  TALK_TO_NPC: "TALK",
};

export function Hud({
  inputManager,
  deviceClass,
}: {
  inputManager: InputManager;
  deviceClass: DeviceClass;
}) {
  const isTouchDevice = deviceClass === "MOBILE" || deviceClass === "TABLET";
  const interactionPrompt = useOfficeStore((s) => s.interactionPrompt);
  const seated = useOfficeStore((s) => s.chair.playerState === "SEATED");
  // While the workstation IDE overlay is open, movement/interaction
  // controls are hidden — normal locomotion is already paused (the
  // player is SEATED), and the joystick/context-button footprint would
  // otherwise sit underneath the full-screen IDE panel. See
  // docs/WORKSTATION_IDE.md "Mobile input isolation".
  const workstationActive = useOfficeStore((s) => s.workstation.mode === "ACTIVE");
  // While a dialogue session is open, the DialogueUI overlay covers the
  // same screen region and movement is suspended (see PlayerCapsule) —
  // same rationale as workstation mode. See docs/DIALOGUE_SYSTEM.md
  // "Mobile dialogue".
  const dialogueActive = useNpcStore((s) => s.dialogue !== null);
  const driving = useVehicleStore((s) => s.drivingVehicleId !== null);
  const nearbyVehicleLabel = useVehicleStore((s) => s.nearbyVehicleLabel);

  if (workstationActive || dialogueActive) return null;

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
          {driving ? (
            <div>W/S accelerate &amp; brake &middot; A/D steer &middot; E exit vehicle</div>
          ) : (
            <>
              <div>WASD move &middot; Shift run &middot; Space jump &middot; E interact &middot; F sit/stand</div>
              <div>Walk up to a parked car or bike and press E to drive it</div>
            </>
          )}
          <div>Click the scene, then move the mouse to look around (360&deg;) &middot; Esc releases the cursor</div>
        </div>
      )}

      {!isTouchDevice && driving && <div style={desktopPromptStyle}>E &mdash; Exit Vehicle</div>}
      {!isTouchDevice && !driving && interactionPrompt && (
        <div style={desktopPromptStyle}>E &mdash; {interactionPrompt.label}</div>
      )}
      {!isTouchDevice && !driving && !interactionPrompt && nearbyVehicleLabel && (
        <div style={desktopPromptStyle}>E &mdash; {nearbyVehicleLabel}</div>
      )}
      {!isTouchDevice && seated && (
        <div style={{ ...desktopPromptStyle, bottom: 84 }}>F &mdash; Stand</div>
      )}

      {/* Rendered before the joystick/buttons below so it sits underneath
          them in stacking order — see TouchLookArea.tsx. */}
      {isTouchDevice && (
        <TouchLookArea onLookDelta={(dx, dy) => inputManager.addLookDelta(dx * 2.2, dy * 2.2)} />
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
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {!driving && (
              <>
                <button
                  onPointerDown={() => inputManager.setMobileRunning(true)}
                  onPointerUp={() => inputManager.setMobileRunning(false)}
                  style={buttonStyle}
                >
                  Run
                </button>
                <button onPointerDown={() => inputManager.triggerJump()} style={buttonStyle}>
                  Jump
                </button>
              </>
            )}
            {driving && (
              <button onPointerDown={() => inputManager.triggerInteract()} style={contextButtonStyle}>
                EXIT
              </button>
            )}
            {!driving && interactionPrompt && (
              <button onPointerDown={() => inputManager.triggerInteract()} style={contextButtonStyle}>
                {INTENT_MOBILE_LABEL[interactionPrompt.intent] ?? "USE"}
              </button>
            )}
            {!driving && !interactionPrompt && nearbyVehicleLabel && (
              <button onPointerDown={() => inputManager.triggerInteract()} style={contextButtonStyle}>
                DRIVE
              </button>
            )}
          </div>
          {seated && (
            <button onPointerDown={() => inputManager.triggerSitToggle()} style={contextButtonStyle}>
              STAND
            </button>
          )}
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

const contextButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "rgba(127,176,255,0.35)",
  border: "1px solid rgba(127,176,255,0.8)",
  fontWeight: 600,
};

const desktopPromptStyle: CSSProperties = {
  position: "absolute",
  bottom: 48,
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(11,13,16,0.72)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 0.3,
};
