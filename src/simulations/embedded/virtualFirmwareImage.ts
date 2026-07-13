import type { FirmwareBehaviourDescriptor, FirmwareProject } from "./FirmwareProject";

export interface VirtualFirmwareImage {
  imageId: string;
  projectId: string;
  targetBoardId: string;
  buildTimestamp: number;
  behaviourDescriptor: FirmwareBehaviourDescriptor;
  /** Deterministic content hash — simulation metadata only, NOT a real MCU binary. */
  checksum: string;
}

/**
 * Deterministic FNV-1a 32-bit hash over the trusted project's source
 * content. Chosen over crypto.subtle.digest because it's synchronous
 * (keeps createVirtualFirmwareImage a pure, easily-testable function)
 * and because this checksum only needs to be a stable, deterministic
 * fingerprint of simulation metadata — not cryptographically secure.
 */
export function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Creates simulation metadata representing a "built" firmware image.
 * This is NOT a real MCU binary — see docs/EMBEDDED_SIMULATION.md
 * "Simulation boundary".
 */
export function createVirtualFirmwareImage(
  project: FirmwareProject,
  buildTimestamp: number,
): VirtualFirmwareImage {
  const combinedSource = project.sourceFiles.map((f) => `${f.path}:${f.content}`).join("\n");
  const checksum = fnv1aHash(`${project.id}|${project.buildProfile}|${combinedSource}`);

  return {
    imageId: `${project.id}-${checksum}`,
    projectId: project.id,
    targetBoardId: project.targetBoardId,
    buildTimestamp,
    behaviourDescriptor: project.expectedBehaviour,
    checksum,
  };
}
