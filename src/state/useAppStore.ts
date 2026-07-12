import { create } from "zustand";
import type { QualityLevel } from "@/config/quality";

export type DeviceClass = "MOBILE" | "TABLET" | "DESKTOP" | "LARGE_DISPLAY";

interface AppState {
  qualityLevel: QualityLevel;
  qualityOverridden: boolean;
  deviceClass: DeviceClass;
  setQualityLevel: (level: QualityLevel, overridden?: boolean) => void;
  setDeviceClass: (deviceClass: DeviceClass) => void;
}

export const useAppStore = create<AppState>((set) => ({
  qualityLevel: "MEDIUM",
  qualityOverridden: false,
  deviceClass: "DESKTOP",
  setQualityLevel: (level, overridden = true) =>
    set({ qualityLevel: level, qualityOverridden: overridden }),
  setDeviceClass: (deviceClass) => set({ deviceClass }),
}));
