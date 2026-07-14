import { create } from "zustand";

/**
 * Vehicle orchestration state. Per-frame vehicle transforms live in
 * refs inside CityVehicles (same no-re-render pattern as the player
 * transform — see docs/PERFORMANCE.md); this store only holds the
 * low-frequency mode flags the UI/other systems subscribe to.
 */
interface VehicleStoreState {
  /** Instance id of the vehicle the player is currently driving, or null on foot. */
  drivingVehicleId: string | null;
  /** Nearest enterable vehicle within prompt range (null when driving or none near). */
  nearbyVehicleId: string | null;
  nearbyVehicleLabel: string | null;
  enterVehicle: (instanceId: string) => void;
  exitVehicle: () => void;
  setNearbyVehicle: (instanceId: string | null, label: string | null) => void;
}

export const useVehicleStore = create<VehicleStoreState>((set) => ({
  drivingVehicleId: null,
  nearbyVehicleId: null,
  nearbyVehicleLabel: null,
  enterVehicle: (instanceId) =>
    set({ drivingVehicleId: instanceId, nearbyVehicleId: null, nearbyVehicleLabel: null }),
  exitVehicle: () => set({ drivingVehicleId: null }),
  setNearbyVehicle: (instanceId, label) =>
    set({ nearbyVehicleId: instanceId, nearbyVehicleLabel: label }),
}));
