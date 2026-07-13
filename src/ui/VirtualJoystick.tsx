"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { normalizeJoystickDelta } from "./joystickMath";

const RADIUS = 50;

/**
 * Real analogue virtual joystick (not directional buttons): tracks a
 * single active pointer within a fixed-radius base, applies a dead zone
 * and radius clamp via normalizeJoystickDelta, and resets when the
 * pointer is released or cancelled (e.g. an incoming call interrupts
 * touch on mobile).
 */
export function VirtualJoystick({
  onChange,
}: {
  onChange: (x: number, y: number) => void;
}) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const pointerId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  function updateFromPointer(e: ReactPointerEvent<HTMLDivElement>) {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const normalized = normalizeJoystickDelta(dx, dy, RADIUS);
    setKnob({ x: normalized.x * RADIUS, y: -normalized.y * RADIUS });
    onChange(normalized.x, normalized.y);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    // Only track the first pointer that engages the joystick; additional
    // simultaneous touches (e.g. camera-look elsewhere) are ignored here
    // by design, keeping this control single-touch while the rest of the
    // input architecture remains multi-touch aware.
    if (pointerId.current !== null) return;
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return;
    updateFromPointer(e);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  }

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: RADIUS * 2,
        height: RADIUS * 2,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.25)",
        touchAction: "none",
        position: "relative",
      }}
      aria-label="Movement joystick"
      role="slider"
      aria-valuenow={0}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(127,176,255,0.9)",
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  );
}
