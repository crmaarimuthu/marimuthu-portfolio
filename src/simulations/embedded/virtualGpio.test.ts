import { describe, expect, it } from "vitest";
import { configurePin, writePin } from "./virtualGpio";

describe("configurePin", () => {
  it("initialises a pin LOW regardless of direction", () => {
    expect(configurePin(5, "OUTPUT")).toEqual({ pin: 5, direction: "OUTPUT", level: "LOW" });
    expect(configurePin(2, "INPUT")).toEqual({ pin: 2, direction: "INPUT", level: "LOW" });
  });
});

describe("writePin", () => {
  it("writes HIGH/LOW on an OUTPUT pin", () => {
    const pin = configurePin(5, "OUTPUT");
    const high = writePin(pin, "HIGH");
    expect(high.level).toBe("HIGH");
    const low = writePin(high, "LOW");
    expect(low.level).toBe("LOW");
  });

  it("rejects writes to an INPUT pin (direction validation)", () => {
    const pin = configurePin(5, "INPUT");
    const result = writePin(pin, "HIGH");
    expect(result.level).toBe("LOW");
    expect(result).toEqual(pin);
  });

  it("is a no-op (same reference semantics via equality) when writing the current level", () => {
    const pin = configurePin(5, "OUTPUT");
    const result = writePin(pin, "LOW");
    expect(result).toEqual(pin);
  });
});
