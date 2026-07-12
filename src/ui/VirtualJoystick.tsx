"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const RADIUS = 50;

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
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    onChange(dx / RADIUS, -dy / RADIUS);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
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
