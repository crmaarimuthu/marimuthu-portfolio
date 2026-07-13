import { describe, expect, it } from "vitest";
import { DEMO_FIRMWARE_PROJECT } from "./FirmwareProject";
import { createVirtualFirmwareImage, fnv1aHash } from "./virtualFirmwareImage";

describe("fnv1aHash", () => {
  it("is deterministic for the same input", () => {
    expect(fnv1aHash("hello")).toBe(fnv1aHash("hello"));
  });

  it("differs for different input", () => {
    expect(fnv1aHash("hello")).not.toBe(fnv1aHash("world"));
  });
});

describe("createVirtualFirmwareImage", () => {
  it("produces a deterministic checksum for the same project + timestamp", () => {
    const a = createVirtualFirmwareImage(DEMO_FIRMWARE_PROJECT, 1000);
    const b = createVirtualFirmwareImage(DEMO_FIRMWARE_PROJECT, 1000);
    expect(a.checksum).toBe(b.checksum);
    expect(a.imageId).toBe(b.imageId);
  });

  it("carries the project's target board and behaviour descriptor", () => {
    const image = createVirtualFirmwareImage(DEMO_FIRMWARE_PROJECT, 1000);
    expect(image.targetBoardId).toBe(DEMO_FIRMWARE_PROJECT.targetBoardId);
    expect(image.behaviourDescriptor).toEqual(DEMO_FIRMWARE_PROJECT.expectedBehaviour);
  });

  it("timestamp is recorded independently of the checksum", () => {
    const a = createVirtualFirmwareImage(DEMO_FIRMWARE_PROJECT, 1000);
    const b = createVirtualFirmwareImage(DEMO_FIRMWARE_PROJECT, 2000);
    expect(a.checksum).toBe(b.checksum);
    expect(a.buildTimestamp).not.toBe(b.buildTimestamp);
  });
});
