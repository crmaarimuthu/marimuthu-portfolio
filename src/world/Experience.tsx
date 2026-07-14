"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PlayerCapsule } from "@/player/PlayerCapsule";
import { CameraController } from "@/player/CameraController";
import { MouseLookController } from "@/player/MouseLookController";
import { InteractionController } from "@/player/InteractionController";
import type { PlayerTransform } from "@/player/playerMovement";
import { emptyInputState, type InputManager, type InputState } from "@/engine/input/InputManager";
import { useKeyboardInput } from "@/engine/input/useKeyboardInput";
import { OfficeExterior } from "./office/OfficeExterior";
import { OfficeInterior } from "./office/OfficeInterior";
import { OfficeStructure } from "./office/OfficeStructure";
import { useOfficeMaterials } from "./office/OfficeMaterials";
import { useOfficeCollisionWalls } from "./office/useOfficeRuntime";
import { resolveOfficeZone } from "./office/officeLayout";
import { useOfficeStore } from "@/state/useOfficeStore";
import { useNpcStore } from "@/state/useNpcStore";
import { useVehicleStore } from "@/state/useVehicleStore";
import { OfficeNpcPopulation } from "./office/npc/OfficeNpcPopulation";
import { CityEnvironment } from "./city/CityEnvironment";
import { CityPedestrians } from "./city/CityPedestrians";
import { TrafficVehicles } from "./city/TrafficVehicles";
import { buildCityCollisionWalls } from "./city/cityLayout";
import { CityVehicles } from "@/vehicles/CityVehicles";
import type { QualityProfile } from "@/config/quality";

const EMPTY_INPUT: InputState = emptyInputState();

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
  const cameraYawRef = useRef(0);
  const teleportRef = useRef<PlayerTransform | null>(null);

  const materials = useOfficeMaterials();
  const officeWalls = useOfficeCollisionWalls();
  const collisionWalls = useMemo(
    () => [...officeWalls, ...buildCityCollisionWalls()],
    [officeWalls],
  );
  const setZone = useOfficeStore((s) => s.setZone);
  const workstationActive = useOfficeStore((s) => s.workstation.mode === "ACTIVE");
  const dialogueActive = useNpcStore((s) => s.dialogue !== null);
  const driving = useVehicleStore((s) => s.drivingVehicleId !== null);

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

  // City density scales down on the low-end profile (see docs/PERFORMANCE.md).
  const lowQuality = quality.level === "LOW";

  return (
    <>
      <CityEnvironment />
      <OfficeExterior materials={materials} />
      <OfficeStructure materials={materials} />
      <OfficeInterior materials={materials} quality={quality} />
      <OfficeNpcPopulation qualityLevel={quality.level} />
      <CityPedestrians walkerCount={lowQuality ? 4 : 8} />
      <TrafficVehicles count={lowQuality ? 2 : 4} />

      {/* Hidden (not unmounted) while driving so its transform/animation
          state survives the drive and E-to-exit teleports it back out. */}
      <group visible={!driving}>
        <PlayerCapsule
          getInputState={driving ? () => EMPTY_INPUT : getInputState}
          getCameraYaw={() => cameraYawRef.current}
          collisionWalls={collisionWalls}
          consumeTeleport={() => {
            const t = teleportRef.current;
            teleportRef.current = null;
            return t;
          }}
          onTransformChange={(t) => {
            if (!driving) transformRef.current = t;
          }}
        />
      </group>
      <CityVehicles
        getInputState={getInputState}
        getPlayerTransform={getPlayerTransform}
        collisionWalls={collisionWalls}
        onDrivingTransform={(t) => {
          transformRef.current = t;
        }}
        requestPlayerTeleport={(t) => {
          teleportRef.current = t;
          transformRef.current = t;
        }}
      />
      {!driving && (
        <InteractionController
          getInputState={getInputState}
          getPlayerTransform={getPlayerTransform}
          collisionWalls={collisionWalls}
        />
      )}
      <CameraController
        getTransform={getPlayerTransform}
        getInputState={getInputState}
        onYawChange={(yaw) => {
          cameraYawRef.current = yaw;
        }}
        reducedMotion={reducedMotion}
      />
      <MouseLookController inputManager={inputManager} enabled={!workstationActive && !dialogueActive} />
    </>
  );
}
