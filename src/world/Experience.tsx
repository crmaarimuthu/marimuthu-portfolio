"use client";

import { useMemo, useRef } from "react";
import { PlayerCapsule } from "@/player/PlayerCapsule";
import { CameraController } from "@/player/CameraController";
import type { PlayerTransform } from "@/player/playerMovement";
import { TestEnvironment } from "./TestEnvironment";
import { InputManager } from "@/engine/input/InputManager";
import { useKeyboardInput } from "@/engine/input/useKeyboardInput";

export function Experience({ inputManager }: { inputManager: InputManager }) {
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
      <CameraController getTransform={() => transformRef.current} />
    </>
  );
}

export function createInputManager() {
  return new InputManager();
}

export function useSharedInputManager() {
  return useMemo(() => new InputManager(), []);
}
