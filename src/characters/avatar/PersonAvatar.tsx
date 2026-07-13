"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { AVATAR_DEFINITIONS, type AvatarVariant } from "./avatarConfig";

/**
 * Renders one instance of a real Renderpeople human model (see
 * docs/ASSET_PIPELINE.md "Renderpeople asset attribution"). Each
 * instance gets its own cloned skeleton (`SkeletonUtils.clone` — a
 * plain `Object3D.clone()` does not correctly duplicate a skinned
 * mesh's skeleton/bind pose, so every avatar instance would otherwise
 * share and fight over one animation state) and its own
 * `AnimationMixer`.
 *
 * Each free model ships with exactly one baked animation clip — there
 * is no separate idle/sit/type/talk/celebrate clip available (see
 * docs/NPC_SYSTEM.md "Avatar variation"). Behaviour:
 * - `nativeClipMotion: "idle"` (Sophia) — the clip always loops; it's
 *   already a subtle idle performance appropriate for every state.
 * - `nativeClipMotion: "walk"` (Nathan) — the clip only advances while
 *   `isMoving` is true; otherwise the mixer is paused, holding
 *   whichever walk-cycle frame was last reached as a static standing
 *   pose. This is a documented, honest fallback — not a fabricated
 *   idle animation.
 */
export function PersonAvatar({
  variant,
  getIsMoving,
  tintColor = "#ffffff",
}: {
  variant: AvatarVariant;
  /**
   * A getter (not a plain boolean prop) — the parent tracks movement in
   * a ref updated every frame without re-rendering (see
   * docs/PLAYER_SYSTEM.md/docs/PERFORMANCE.md), so a plain prop would
   * only ever reflect the value from PersonAvatar's initial render.
   */
  getIsMoving: () => boolean;
  tintColor?: string;
}) {
  const definition = AVATAR_DEFINITIONS[variant];
  const fbx = useFBX(definition.modelUrl);
  const texture = useTexture(definition.textureUrl);
  const cloned = useMemo(() => SkeletonUtils.clone(fbx) as THREE.Group, [fbx]);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    // Clone rather than mutate the (drei-cached, potentially shared)
    // texture returned by useTexture — each avatar instance gets its
    // own texture object with the correct colorSpace set.
    const colorTexture = texture.clone();
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    colorTexture.needsUpdate = true;

    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = false;
      child.material = new THREE.MeshStandardMaterial({
        map: colorTexture,
        color: tintColor,
        roughness: 0.85,
      });
    });

    const mixer = new THREE.AnimationMixer(cloned);
    mixerRef.current = mixer;

    const clip = fbx.animations[0];
    if (clip) {
      const action = mixer.clipAction(clip, cloned);
      action.play();
      actionRef.current = action;
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [cloned, fbx, texture, tintColor]);

  useFrame((_, dt) => {
    const mixer = mixerRef.current;
    if (!mixer || !actionRef.current) return;
    if (definition.nativeClipMotion === "idle" || getIsMoving()) {
      mixer.update(dt);
    }
  });

  return <primitive object={cloned} scale={definition.scale} />;
}

export function preloadPersonAvatars(): void {
  for (const def of Object.values(AVATAR_DEFINITIONS)) {
    useFBX.preload(def.modelUrl);
  }
}
