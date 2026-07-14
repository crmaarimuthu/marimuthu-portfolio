"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InputState } from "@/engine/input/InputManager";
import type { PlayerTransform } from "@/player/playerMovement";
import { PLAYER_RADIUS } from "@/player/PlayerConfig";
import { isPointBlocked, resolveWallCollisions, type CollisionWall } from "@/world/office/collision";
import { CITY_BOUNDS } from "@/world/city/cityLayout";
import { useVehicleStore } from "@/state/useVehicleStore";
import { PARKED_VEHICLES, VEHICLE_ENTER_RADIUS, VEHICLE_MODELS } from "./vehicleConfig";
import { stepVehicle, type VehicleState } from "./vehiclePhysics";
import { VehicleModel } from "./VehicleModel";

/** Collision radius approximating a car body for the circle-vs-AABB resolver. */
const VEHICLE_COLLISION_RADIUS = 1.3;
/** Where the player is placed relative to the vehicle when exiting (driver's side). */
const EXIT_SIDE_OFFSET = 2.2;

/**
 * Renders every enterable vehicle and runs the drive loop. Per-frame
 * vehicle transforms live in a ref map (no React re-renders — same
 * pattern as the player transform); the Zustand store only carries the
 * enter/exit/nearby mode flags. Walking up to a vehicle and pressing
 * E (or the mobile DRIVE button) takes the wheel: joystick/WASD then
 * feed the arcade physics in vehiclePhysics.ts, the camera follows the
 * vehicle through the existing player-transform getter, and E again
 * steps out onto the nearest unblocked spot.
 */
export function CityVehicles({
  getInputState,
  getPlayerTransform,
  collisionWalls,
  onDrivingTransform,
  requestPlayerTeleport,
}: {
  getInputState: () => InputState;
  getPlayerTransform: () => PlayerTransform;
  collisionWalls: CollisionWall[];
  /** Called every driving frame so the camera/zone systems follow the vehicle. */
  onDrivingTransform: (t: PlayerTransform) => void;
  /** Repositions the on-foot player (used when stepping out of a vehicle). */
  requestPlayerTeleport: (t: PlayerTransform) => void;
}) {
  const statesRef = useRef<Map<string, VehicleState>>(
    new Map(
      PARKED_VEHICLES.map((p) => [p.instanceId, { x: p.x, z: p.z, heading: p.heading, speed: 0 }]),
    ),
  );
  const groupsRef = useRef<Map<string, THREE.Group>>(new Map());

  useFrame((_, dt) => {
    const store = useVehicleStore.getState();
    const input = getInputState();
    const drivingId = store.drivingVehicleId;

    if (drivingId) {
      const placement = PARKED_VEHICLES.find((p) => p.instanceId === drivingId);
      const state = statesRef.current.get(drivingId);
      if (placement && state) {
        const spec = VEHICLE_MODELS[placement.model].spec;
        let next = stepVehicle(state, { throttle: input.moveY, steer: input.moveX }, spec, dt);

        // Circle-vs-AABB against the same walls the player uses; a
        // resolved pushback also kills the speed so the car doesn't
        // grind through facades.
        const resolved = resolveWallCollisions(
          { x: next.x, z: next.z },
          VEHICLE_COLLISION_RADIUS,
          collisionWalls,
        );
        const bumped = resolved.x !== next.x || resolved.z !== next.z;
        next = {
          x: clamp(resolved.x, CITY_BOUNDS.minX, CITY_BOUNDS.maxX),
          z: clamp(resolved.z, CITY_BOUNDS.minZ, CITY_BOUNDS.maxZ),
          heading: next.heading,
          speed: bumped ? next.speed * 0.25 : next.speed,
        };

        statesRef.current.set(drivingId, next);
        onDrivingTransform({ x: next.x, z: next.z, heading: next.heading });

        if (input.interactPressed) {
          const exit = findExitSpot(next, collisionWalls);
          if (exit) {
            statesRef.current.set(drivingId, { ...next, speed: 0 });
            requestPlayerTeleport(exit);
            store.exitVehicle();
          }
        }
      }
    } else {
      // On foot: track the nearest enterable vehicle for the prompt/HUD.
      const player = getPlayerTransform();
      let nearestId: string | null = null;
      let nearestLabel: string | null = null;
      let nearestDistance = VEHICLE_ENTER_RADIUS;
      for (const placement of PARKED_VEHICLES) {
        const state = statesRef.current.get(placement.instanceId);
        if (!state) continue;
        const d = Math.hypot(state.x - player.x, state.z - player.z);
        if (d < nearestDistance) {
          nearestDistance = d;
          nearestId = placement.instanceId;
          nearestLabel = placement.promptLabel;
        }
      }
      if (nearestId !== store.nearbyVehicleId) {
        store.setNearbyVehicle(nearestId, nearestLabel);
      }
      if (input.interactPressed && nearestId) {
        store.enterVehicle(nearestId);
      }
    }

    // Sync visuals from the state map.
    for (const [id, group] of groupsRef.current) {
      const state = statesRef.current.get(id);
      if (!state) continue;
      group.position.set(state.x, 0, state.z);
      group.rotation.y = state.heading;
    }
  });

  return (
    <group>
      {PARKED_VEHICLES.map((placement) => (
        <group
          key={placement.instanceId}
          ref={(node) => {
            if (node) groupsRef.current.set(placement.instanceId, node);
            else groupsRef.current.delete(placement.instanceId);
          }}
          position={[placement.x, 0, placement.z]}
          rotation={[0, placement.heading, 0]}
        >
          <VehicleModel model={placement.model} />
        </group>
      ))}
    </group>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Try driver's side first, then the other side, then behind the vehicle. */
function findExitSpot(state: VehicleState, walls: CollisionWall[]): PlayerTransform | null {
  const candidates: Array<[number, number]> = [
    [state.heading + Math.PI / 2, EXIT_SIDE_OFFSET],
    [state.heading - Math.PI / 2, EXIT_SIDE_OFFSET],
    [state.heading + Math.PI, EXIT_SIDE_OFFSET + 1],
  ];
  for (const [angle, distance] of candidates) {
    const x = state.x + Math.sin(angle) * distance;
    const z = state.z + Math.cos(angle) * distance;
    if (!isPointBlocked({ x, z }, PLAYER_RADIUS, walls)) {
      return { x, z, heading: state.heading };
    }
  }
  return null;
}
