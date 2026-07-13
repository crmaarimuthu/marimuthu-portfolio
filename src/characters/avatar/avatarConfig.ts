/**
 * Real human avatar variants, sourced from Renderpeople's free-tier
 * sample pack (https://renderpeople.com/free-3d-people/), licensed for
 * commercial/real-time use (see docs/ASSET_PIPELINE.md "Renderpeople
 * asset attribution"). Only two distinct people are available at the
 * free tier with usable baked animation — every player/NPC instance
 * reuses one of these two models, differentiated by a per-character
 * clothing tint (`tintColor`) rather than being a unique scan each —
 * documented tradeoff, see docs/NPC_SYSTEM.md "Avatar variation".
 */
export type AvatarVariant = "nathan" | "sophia";

export interface AvatarDefinition {
  variant: AvatarVariant;
  /** Public/ path to the FBX model. */
  modelUrl: string;
  /** Public/ path to the (pre-resized, see docs/ASSET_PIPELINE.md) diffuse texture. */
  textureUrl: string;
  /**
   * The one baked animation clip this model ships with, and what kind
   * of motion it represents. Only one clip exists per free model —
   * there is no separate idle/sit/type/talk/celebrate clip available.
   */
  nativeClipMotion: "walk" | "idle";
  /** Uniform scale applied so the model matches PLAYER_CAPSULE_HEIGHT-scale characters. */
  scale: number;
}

export const AVATAR_DEFINITIONS: Record<AvatarVariant, AvatarDefinition> = {
  nathan: {
    variant: "nathan",
    modelUrl: "/models/people/nathan/model.fbx",
    textureUrl: "/models/people/nathan/diffuse.jpg",
    nativeClipMotion: "walk",
    scale: 0.01,
  },
  sophia: {
    variant: "sophia",
    modelUrl: "/models/people/sophia/model.fbx",
    textureUrl: "/models/people/sophia/diffuse.jpg",
    nativeClipMotion: "idle",
    scale: 0.01,
  },
};

/** Deterministic variant assignment so the same character always gets the same model. */
export function pickAvatarVariant(seedKey: string): AvatarVariant {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? "nathan" : "sophia";
}

/** Per-character clothing tint — the only differentiation between two NPCs sharing a model. */
const TINT_PALETTE = ["#ffffff", "#e0b34c", "#c97fe0", "#4cc2e0", "#4ce07a", "#e08a4c", "#7c9fe0", "#e0e04c"];

export function pickTintColor(seedKey: string): string {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 17 + seedKey.charCodeAt(i)) >>> 0;
  }
  return TINT_PALETTE[hash % TINT_PALETTE.length];
}
