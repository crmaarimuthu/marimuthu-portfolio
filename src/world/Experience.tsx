"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PlayerCapsule } from "@/player/PlayerCapsule";
import { CameraController } from "@/player/CameraController";
import { InteractionController } from "@/player/InteractionController";
import type { PlayerTransform } from "@/player/playerMovement";
import { TestEnvironment } from "./TestEnvironment";
import { emptyInputState, type InputManager, type InputState } from "@/engine/input/InputManager";
import { useKeyboardInput } from "@/engine/input/useKeyboardInput";
import { OfficeExterior } from "./office/OfficeExterior";
import { OfficeInterior } from "./office/OfficeInterior";
import { OfficeStructure } from "./office/OfficeStructure";
import { useOfficeMaterials } from "./office/OfficeMaterials";
import { useOfficeCollisionWalls } from "./office/useOfficeRuntime";
import { resolveOfficeZone } from "./office/officeLayout";
import { useOfficeStore } from "@/state/useOfficeStore";
import { OfficeNpcPopulation } from "./office/npc/OfficeNpcPopulation";
import type { QualityProfile } from "@/config/quality";

export function Experience({
  inputManager,
  reducedMotion = false,
  quality,
}: {
  inputManager: InputManager;
  reducedMotion?: boolean;
  quality: QualityProfile;
}) {
  useKeyboardInput(inputManager);
  const transformRef = useRef<PlayerTransform>({ x: 0, z: 0, heading: 0 });
  const inputStateRef = useRef<InputState>(emptyInputState());
  const lastZoneRef = useRef<string | null>(null);

  const materials = useOfficeMaterials();
  const collisionWalls = useOfficeCollisionWalls();
  const setZone = useOfficeStore((s) => s.setZone);

  // Subscribed first (Experience mounts before its children), so this
  // consumes the frame's input state before PlayerCapsule/
  // InteractionController read the cached value below.
  useFrame(() => {
    inputStateRef.current = inputManager.consumeFrameState();

    const zone = resolveOfficeZone(transformRef.current.x, transformRef.current.z);
    if (zone !== lastZoneRef.current) {
      lastZoneRef.current = zone;
      setZone(zone);
    }
  });

  const getInputState = () => inputStateRef.current;
  const getPlayerTransform = () => transformRef.current;

  return (
    <>
      <TestEnvironment />
      <OfficeExterior materials={materials} />
      <OfficeStructure materials={materials} />
      <OfficeInterior materials={materials} quality={quality} />
      <OfficeNpcPopulation qualityLevel={quality.level} />

      <PlayerCapsule
        getInputState={getInputState}
        collisionWalls={collisionWalls}
        onTransformChange={(t) => {
          transformRef.current = t;
        }}
      />
      <InteractionController
        getInputState={getInputState}
        getPlayerTransform={getPlayerTransform}
        collisionWalls={collisionWalls}
      />
      <CameraController getTransform={getPlayerTransform} reducedMotion={reducedMotion} />
    </>
  );
}
