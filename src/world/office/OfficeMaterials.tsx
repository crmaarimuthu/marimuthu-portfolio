"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Shared, memoized materials for the office so repeated furniture/wall
 * instances reuse a small handful of GPU material objects instead of
 * allocating one per mesh (see docs/PERFORMANCE.md).
 */
export function useOfficeMaterials() {
  return useMemo(
    () => ({
      wall: new THREE.MeshStandardMaterial({ color: "#cfd3d8", roughness: 0.9 }),
      floor: new THREE.MeshStandardMaterial({ color: "#8d8f92", roughness: 0.95 }),
      floorAccent: new THREE.MeshStandardMaterial({ color: "#5f6469", roughness: 0.85 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#9fc7de",
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35,
      }),
      deskSurface: new THREE.MeshStandardMaterial({ color: "#c9a876", roughness: 0.6 }),
      deskFrame: new THREE.MeshStandardMaterial({ color: "#3a3d42", roughness: 0.5, metalness: 0.4 }),
      chair: new THREE.MeshStandardMaterial({ color: "#2f3237", roughness: 0.7 }),
      monitor: new THREE.MeshStandardMaterial({ color: "#111316", roughness: 0.3 }),
      screenGlow: new THREE.MeshStandardMaterial({
        color: "#5f9dff",
        emissive: "#3d7bff",
        emissiveIntensity: 0.6,
      }),
      equipment: new THREE.MeshStandardMaterial({ color: "#4a4f56", roughness: 0.5, metalness: 0.3 }),
      accent: new THREE.MeshStandardMaterial({ color: "#7fb0ff", roughness: 0.4, metalness: 0.2 }),
      door: new THREE.MeshStandardMaterial({ color: "#5a4632", roughness: 0.6 }),
      signage: new THREE.MeshStandardMaterial({ color: "#161a1f", roughness: 0.4 }),
      roof: new THREE.MeshStandardMaterial({ color: "#454951", roughness: 0.8 }),
    }),
    [],
  );
}

export type OfficeMaterials = ReturnType<typeof useOfficeMaterials>;
