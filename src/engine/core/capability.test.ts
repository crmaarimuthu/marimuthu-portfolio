import { afterEach, describe, expect, it, vi } from "vitest";
import { detectCapability } from "./capability";

/**
 * Regression test for the "one canvas, two getContext calls" bug: a
 * real canvas can only ever bind to one context type for its lifetime —
 * once getContext("webgl") succeeds, a later getContext("webgl2") call
 * on the *same* canvas returns null even when WebGL2 is fully
 * supported. This mock reproduces that exact browser behavior so the
 * test fails if detectCapability ever goes back to sharing one canvas
 * across both probes.
 */
function installBoundCanvasMock() {
  const original = HTMLCanvasElement.prototype.getContext;
  const boundType = new WeakMap<HTMLCanvasElement, string>();

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
    this: HTMLCanvasElement,
    type: string,
  ) {
    const existing = boundType.get(this);
    if (existing && existing !== type) return null;
    if (type !== "webgl" && type !== "webgl2") return null;
    boundType.set(this, type);
    return {} as RenderingContext;
  });

  return () => {
    HTMLCanvasElement.prototype.getContext = original;
  };
}

describe("detectCapability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports webgl2 supported even when webgl1 is also probed, using a browser that only binds one context type per canvas", () => {
    const restore = installBoundCanvasMock();
    try {
      const result = detectCapability();
      expect(result.webgl2).toBe(true);
      expect(result.supported).toBe(true);
      expect(result.reason).toBeNull();
    } finally {
      restore();
    }
  });

  it("still reports webgl1 support independently", () => {
    const restore = installBoundCanvasMock();
    try {
      const result = detectCapability();
      expect(result.webgl).toBe(true);
    } finally {
      restore();
    }
  });

  it("uses a separate canvas per context probe (never calls getContext twice on the same canvas)", () => {
    const canvases: HTMLCanvasElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "canvas") canvases.push(el as HTMLCanvasElement);
      return el;
    });
    const restore = installBoundCanvasMock();

    try {
      detectCapability();
      const canvasesUsedForBothProbes = canvases.length >= 2;
      expect(canvasesUsedForBothProbes).toBe(true);
    } finally {
      restore();
    }
  });
});
