"use client";

import { useRef } from "react";
import { PlayerCapsule } from "@/player/PlayerCapsule";
import { CameraController } from "@/player/CameraController";
import type { PlayerTransform } from "@/player/playerMovement";
import { TestEnvironment } from "./TestEnvironment";
import type { InputManager } from "@/engine/input/InputManager";
import { useKeyboardInput } from "@/engine/input/useKeyboardInput";

export function Experience({
  inputManager,
  reducedMotion = false,
}: {
  inputManager: InputManager;
  reducedMotion?: boolean;
}) {
  useKeyboardInput(inputManager);
  const transformRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });

  return (
    <>
      <TestEnvironment />
      <PlayerCapsule
        inputManager={inputManager}
        onTransformChange={(t) => {
          transformRef.current = t;
        }}
      />
      <CameraController getTransform={() => transformRef.current} reducedMotion={reducedMotion} />
    </>
  );
}
