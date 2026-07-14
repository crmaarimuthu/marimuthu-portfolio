"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleModel } from "@/vehicles/VehicleModel";
import type { VehicleModelId } from "@/vehicles/vehicleConfig";
import { advanceAlongLoop, type LoopPoint } from "./pathLoop";

/**
 * Ambient traffic: non-enterable cars driving fixed lane loops around
 * the city blocks (lane centres from cityLayout.ts roads; the loops
 * deliberately avoid the curb parking bays used by CityVehicles).
 * Purely visual — no physics, no interaction, driven by the same
 * unit-tested advanceAlongLoop helper as the pedestrians.
 */

// Clockwise outer loop: main-street south lane → east avenue → north-street north lane → west avenue.
const OUTER_LOOP: LoopPoint[] = [
  { x: -50, z: 2 },
  { x: 50, z: 2 },
  { x: 50, z: 54 },
  { x: -50, z: 54 },
];

// Opposite-direction inner loop on the facing lanes.
const INNER_LOOP: LoopPoint[] = [
  { x: -46, z: 6 },
  { x: -46, z: 50 },
  { x: 46, z: 50 },
  { x: 46, z: 6 },
];

interface TrafficCar {
  id: string;
  model: VehicleModelId;
  loop: LoopPoint[];
  /** m/s */
  speed: number;
  /** Starting offset along the loop perimeter (m). */
  startOffset: number;
}

const TRAFFIC_CARS: TrafficCar[] = [
  { id: "traffic-sedan", model: "sedan", loop: OUTER_LOOP, speed: 8, startOffset: 0 },
  { id: "traffic-taxi", model: "taxi", loop: OUTER_LOOP, speed: 8, startOffset: 120 },
  { id: "traffic-suv", model: "suv", loop: INNER_LOOP, speed: 7, startOffset: 40 },
  { id: "traffic-van", model: "van", loop: INNER_LOOP, speed: 7, startOffset: 180 },
];

export function TrafficVehicles({ count = TRAFFIC_CARS.length }: { count?: number }) {
  const cars = TRAFFIC_CARS.slice(0, count);
  const elapsedRef = useRef(0);
  const groupsRef = useRef<Map<string, THREE.Group>>(new Map());

  useFrame((_, dt) => {
    elapsedRef.current += dt;
    for (const car of cars) {
      const group = groupsRef.current.get(car.id);
      if (!group) continue;
      const pose = advanceAlongLoop(car.loop, car.startOffset + elapsedRef.current * car.speed);
      group.position.set(pose.x, 0, pose.z);
      group.rotation.y = pose.heading;
    }
  });

  return (
    <group>
      {cars.map((car) => (
        <group
          key={car.id}
          ref={(node) => {
            if (node) groupsRef.current.set(car.id, node);
            else groupsRef.current.delete(car.id);
          }}
        >
          <VehicleModel model={car.model} />
        </group>
      ))}
    </group>
  );
}
