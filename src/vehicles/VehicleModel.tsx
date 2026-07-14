"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { VEHICLE_MODELS, type VehicleModelId } from "./vehicleConfig";

/**
 * Kenney's vehicle GLBs are authored in the Godot convention (forward =
 * local -Z), while this project's heading convention is forward =
 * (sin h, cos h), i.e. +Z at heading 0 — so every model is yawed 180°
 * inside its instance group.
 */
const MODEL_FORWARD_OFFSET = Math.PI;

/**
 * One visual vehicle instance: clones the (drei-cached, shared) GLTF
 * scene so multiple instances of the same model don't fight over one
 * Object3D, then normalises scale so the model's longest horizontal
 * dimension matches the catalogue's real-world `length` and its wheels
 * rest on y=0.
 */
export function VehicleModel({ model }: { model: VehicleModelId }) {
  const definition = VEHICLE_MODELS[model];
  const gltf = useGLTF(definition.modelUrl);

  const { cloned, scale, yOffset } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.z) || 1;
    const factor = definition.length / longest;
    return { cloned: clonedScene, scale: factor, yOffset: -box.min.y * factor };
  }, [gltf, definition.length]);

  return (
    <group rotation={[0, MODEL_FORWARD_OFFSET, 0]}>
      <primitive object={cloned} scale={scale} position={[0, yOffset, 0]} />
    </group>
  );
}

export function preloadVehicleModels(): void {
  for (const def of Object.values(VEHICLE_MODELS)) {
    useGLTF.preload(def.modelUrl);
  }
}
