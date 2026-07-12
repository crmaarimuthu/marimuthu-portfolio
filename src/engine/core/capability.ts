export interface CapabilityResult {
  webgl2: boolean;
  supported: boolean;
  reason: string | null;
}

/**
 * Probes for WebGL2 support. Must only run client-side (browser APIs).
 */
export function detectCapability(): CapabilityResult {
  if (typeof document === "undefined") {
    return { webgl2: false, supported: false, reason: "no-document" };
  }

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      return { webgl2: false, supported: false, reason: "no-webgl2-context" };
    }
    return { webgl2: true, supported: true, reason: null };
  } catch {
    return { webgl2: false, supported: false, reason: "context-creation-threw" };
  }
}
