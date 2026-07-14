import {
  CAR_SPEC,
  MOTORCYCLE_SPEC,
  SPORTS_CAR_SPEC,
  TRUCK_SPEC,
  type VehicleSpec,
} from "./vehiclePhysics";

/**
 * Vehicle model catalogue. All GLBs are free, license-verified assets:
 * Kenney Car Kit (CC0) and Kenney Starter Kit Racing (MIT) — see
 * docs/ASSET_PIPELINE.md "Kenney asset attribution" and the LICENSE
 * files committed alongside the models in public/models/vehicles/.
 */

export type VehicleModelId =
  | "sedan"
  | "sedan-sports"
  | "hatchback-sports"
  | "suv"
  | "taxi"
  | "police"
  | "van"
  | "delivery"
  | "truck"
  | "race"
  | "motorcycle";

export interface VehicleModelDefinition {
  id: VehicleModelId;
  label: string;
  modelUrl: string;
  spec: VehicleSpec;
  /** Target world length (metres) the GLB is scaled to. */
  length: number;
}

export const VEHICLE_MODELS: Record<VehicleModelId, VehicleModelDefinition> = {
  sedan: { id: "sedan", label: "Sedan", modelUrl: "/models/vehicles/sedan.glb", spec: CAR_SPEC, length: 4.4 },
  "sedan-sports": { id: "sedan-sports", label: "Sports Sedan", modelUrl: "/models/vehicles/sedan-sports.glb", spec: SPORTS_CAR_SPEC, length: 4.6 },
  "hatchback-sports": { id: "hatchback-sports", label: "Hot Hatch", modelUrl: "/models/vehicles/hatchback-sports.glb", spec: SPORTS_CAR_SPEC, length: 4.0 },
  suv: { id: "suv", label: "SUV", modelUrl: "/models/vehicles/suv.glb", spec: CAR_SPEC, length: 4.7 },
  taxi: { id: "taxi", label: "Taxi", modelUrl: "/models/vehicles/taxi.glb", spec: CAR_SPEC, length: 4.4 },
  police: { id: "police", label: "Police Car", modelUrl: "/models/vehicles/police.glb", spec: SPORTS_CAR_SPEC, length: 4.6 },
  van: { id: "van", label: "Van", modelUrl: "/models/vehicles/van.glb", spec: CAR_SPEC, length: 4.8 },
  delivery: { id: "delivery", label: "Delivery Truck", modelUrl: "/models/vehicles/delivery.glb", spec: TRUCK_SPEC, length: 5.4 },
  truck: { id: "truck", label: "Truck", modelUrl: "/models/vehicles/truck.glb", spec: TRUCK_SPEC, length: 5.6 },
  race: { id: "race", label: "Race Car", modelUrl: "/models/vehicles/race.glb", spec: SPORTS_CAR_SPEC, length: 4.4 },
  motorcycle: { id: "motorcycle", label: "Motorcycle", modelUrl: "/models/vehicles/motorcycle.glb", spec: MOTORCYCLE_SPEC, length: 2.2 },
};

export interface ParkedVehiclePlacement {
  /** Unique instance id (multiple instances may share a model). */
  instanceId: string;
  model: VehicleModelId;
  x: number;
  z: number;
  heading: number;
  /** Shown in the interaction prompt ("E — Drive My Car"). */
  promptLabel: string;
}

/**
 * Every parked vehicle is drivable. The player's own car and bike sit
 * on the office forecourt beside the entrance plaza; the rest are
 * street-parked variety along the main road curb lanes.
 */
export const PARKED_VEHICLES: ParkedVehiclePlacement[] = [
  // The player's vehicles, right outside the office.
  { instanceId: "my-car", model: "sedan-sports", x: 8, z: -9, heading: Math.PI / 2, promptLabel: "Drive My Car" },
  { instanceId: "my-bike", model: "motorcycle", x: 5, z: -9, heading: Math.PI / 2, promptLabel: "Ride My Bike" },
  // Street parking in curb bays beside the main road (off the traffic
  // lanes at z=2/z=6 used by TrafficVehicles' loops).
  { instanceId: "street-taxi", model: "taxi", x: -30, z: -1.5, heading: Math.PI / 2, promptLabel: "Drive the Taxi" },
  { instanceId: "street-suv", model: "suv", x: -18, z: -1.5, heading: Math.PI / 2, promptLabel: "Drive the SUV" },
  { instanceId: "street-police", model: "police", x: 20, z: -1.5, heading: -Math.PI / 2, promptLabel: "Drive the Police Car" },
  { instanceId: "street-van", model: "van", x: 32, z: -1.5, heading: -Math.PI / 2, promptLabel: "Drive the Van" },
  { instanceId: "street-hatch", model: "hatchback-sports", x: -42, z: 9.5, heading: -Math.PI / 2, promptLabel: "Drive the Hot Hatch" },
  { instanceId: "street-race", model: "race", x: 40, z: 9.5, heading: Math.PI / 2, promptLabel: "Drive the Race Car" },
  { instanceId: "street-truck", model: "truck", x: -8, z: 46.5, heading: Math.PI / 2, promptLabel: "Drive the Truck" },
  { instanceId: "street-delivery", model: "delivery", x: 12, z: 57.5, heading: -Math.PI / 2, promptLabel: "Drive the Delivery Truck" },
];

/** Distance (m) within which the drive prompt appears. */
export const VEHICLE_ENTER_RADIUS = 3.2;
