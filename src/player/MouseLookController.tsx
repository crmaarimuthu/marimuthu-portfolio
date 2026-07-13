"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { InputManager } from "@/engine/input/InputManager";

/**
 * Desktop mouse-look via the Pointer Lock API: clicking the canvas
 * requests pointer lock; while locked, `mousemove`'s `movementX/Y`
 * feed `InputManager.addLookDelta`, consumed by CameraController for
 * full 360-degree orbit. The browser itself releases pointer lock on
 * Escape — no extra handling needed for that.
 *
 * `enabled=false` (workstation mode, an open dialogue, or a 2D
 * fallback) actively exits pointer lock so the real cursor is usable
 * for UI — see docs/PLAYER_SYSTEM.md "Mouse look".
 */
export function MouseLookController({
  inputManager,
  enabled,
}: {
  inputManager: InputManager;
  enabled: boolean;
}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    if (!enabled) {
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
      return;
    }

    function requestLock() {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock().catch(() => {
          // Some browsers reject rapid re-requests right after an
          // exitPointerLock(); a subsequent click will simply retry.
        });
      }
    }

    function handleMouseMove(e: MouseEvent) {
      if (document.pointerLockElement !== canvas) return;
      inputManager.addLookDelta(e.movementX, e.movementY);
    }

    canvas.addEventListener("click", requestLock);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", requestLock);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gl, inputManager, enabled]);

  return null;
}
