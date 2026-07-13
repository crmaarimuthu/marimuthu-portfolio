"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Right-side drag-to-look region for touch devices — the mobile
 * equivalent of desktop pointer-lock mouse look (see
 * MouseLookController.tsx). Unlike the joystick, this reports
 * frame-to-frame drag *deltas*, not an absolute stick position: there
 * is no resting knob, the finger can drag anywhere and just keeps
 * rotating the camera while it moves.
 *
 * Positioned to the right of the joystick/run/interact buttons in the
 * HUD's DOM order (see Hud.tsx) so those controls — rendered after,
 * and therefore stacked on top in the same positioning context — still
 * receive their own touches first even though this layer visually
 * spans behind them.
 */
export function TouchLookArea({ onLookDelta }: { onLookDelta: (dx: number, dy: number) => void }) {
  const pointerId = useRef<number | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (pointerId.current !== null) return;
    pointerId.current = e.pointerId;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onLookDelta(dx, dy);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: "40%",
        touchAction: "none",
        pointerEvents: "auto",
      }}
      aria-label="Camera look (drag to orbit)"
    />
  );
}
