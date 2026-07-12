"use client";

import { useEffect, useState } from "react";
import type { DeviceClass } from "@/state/useAppStore";

function classify(width: number, hasTouch: boolean): DeviceClass {
  if (width >= 1920) return "LARGE_DISPLAY";
  if (hasTouch && width < 768) return "MOBILE";
  if (hasTouch && width < 1200) return "TABLET";
  return "DESKTOP";
}

export function useDeviceClass(): DeviceClass {
  const [deviceClass, setDeviceClass] = useState<DeviceClass>("DESKTOP");

  useEffect(() => {
    const hasTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    function update() {
      setDeviceClass(classify(window.innerWidth, hasTouch));
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return deviceClass;
}
