import { create } from "zustand";
import { persistQualityOverride, clearPersistedQualityOverride, type QualityLevel } from "@/config/quality";

export type DeviceClass = "MOBILE" | "TABLET" | "DESKTOP" | "LARGE_DISPLAY";

interface AppState {
  qualityLevel: QualityLevel;
  qualityOverridden: boolean;
  deviceClass: DeviceClass;
  /** overridden=true persists the choice as a manual, user-driven override. */
  setQualityLevel: (level: QualityLevel, overridden?: boolean) => void;
  resetQualityOverride: () => void;
  setDeviceClass: (deviceClass: DeviceClass) => void;
}

export const useAppStore = create<AppState>((set) => ({
  qualityLevel: "MEDIUM",
  qualityOverridden: false,
  deviceClass: "DESKTOP",
  setQualityLevel: (level, overridden = true) => {
    if (overridden) persistQualityOverride(level);
    set({ qualityLevel: level, qualityOverridden: overridden });
  },
  resetQualityOverride: () => {
    clearPersistedQualityOverride();
    set({ qualityOverridden: false });
  },
  setDeviceClass: (deviceClass) => set({ deviceClass }),
}));
