"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  CITY_BUILDINGS,
  CITY_GROUND_SIZE,
  CITY_ROADS,
  CITY_SIDEWALKS,
  CITY_STREETLIGHTS,
  CITY_TREES,
  type CityBuildingModel as CityBuildingModelId,
  type CityBuildingPlacement,
} from "./cityLayout";

/**
 * The open-world city surrounding the office: ground, asphalt roads
 * with lane markings, sidewalks, Kenney City Kit buildings (CC0 — see
 * docs/ASSET_PIPELINE.md), sidewalk trees, and street lamps. Also owns
 * the scene's sun/ambient lighting (previously in TestEnvironment).
 * All placement data comes from cityLayout.ts (unit-tested, pure).
 */
export function CityEnvironment() {
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[40, 60, 20]} intensity={1.2} castShadow />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_GROUND_SIZE, CITY_GROUND_SIZE]} />
        <meshStandardMaterial color="#4a5548" roughness={1} />
      </mesh>

      {CITY_ROADS.map((road) => (
        <Road key={road.id} bounds={road.bounds} axis={road.axis} />
      ))}

      {CITY_SIDEWALKS.map((sw, i) => (
        <mesh
          key={i}
          position={[(sw.minX + sw.maxX) / 2, 0.02, (sw.minZ + sw.maxZ) / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[sw.maxX - sw.minX, sw.maxZ - sw.minZ]} />
          <meshStandardMaterial color="#8b8f93" roughness={0.95} />
        </mesh>
      ))}

      {CITY_BUILDINGS.map((building) => (
        <CityBuilding key={building.id} placement={building} />
      ))}

      {CITY_TREES.map((tree) => (
        <CityTreeModel key={tree.id} x={tree.x} z={tree.z} scale={tree.scale} />
      ))}

      {CITY_STREETLIGHTS.map((lamp) => (
        <StreetLamp key={lamp.id} x={lamp.x} z={lamp.z} />
      ))}
    </group>
  );
}

function Road({
  bounds,
  axis,
}: {
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  axis: "x" | "z";
}) {
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;

  // Dashed centre line along the road's long axis.
  const dashes = useMemo(() => {
    const length = axis === "x" ? width : depth;
    const positions: number[] = [];
    for (let d = -length / 2 + 2; d < length / 2 - 2; d += 6) {
      positions.push(d);
    }
    return positions;
  }, [axis, width, depth]);

  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#2e3134" roughness={0.9} />
      </mesh>
      {dashes.map((d, i) => (
        <mesh
          key={i}
          position={axis === "x" ? [d, 0.02, 0] : [0, 0.02, d]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={axis === "x" ? [3, 0.25] : [0.25, 3]} />
          <meshStandardMaterial color="#d8d4c2" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function CityBuilding({ placement }: { placement: CityBuildingPlacement }) {
  const gltf = useGLTF(modelUrl(placement.model));

  const { cloned, scale, yOffset } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // Non-uniform normalisation: footprint drives XZ (matching the
    // collision AABB in cityLayout.ts), target height drives Y.
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const horizontal = Math.max(size.x, size.z) || 1;
    const xzScale = placement.footprint / horizontal;
    const yScale = placement.height / (size.y || 1);
    return {
      cloned: clonedScene,
      scale: [xzScale, yScale, xzScale] as [number, number, number],
      yOffset: -box.min.y * yScale,
    };
  }, [gltf, placement.footprint, placement.height]);

  return (
    <group position={[placement.x, 0, placement.z]} rotation={[0, placement.rotationY, 0]}>
      <primitive object={cloned} scale={scale} position={[0, yOffset, 0]} />
    </group>
  );
}

function modelUrl(model: CityBuildingModelId): string {
  return `/models/city/${model}.glb`;
}

const TREE_URL = "/models/city/tree-large.glb";

function CityTreeModel({ x, z, scale }: { x: number; z: number; scale: number }) {
  const gltf = useGLTF(TREE_URL);
  const { cloned, factor, yOffset } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) child.castShadow = true;
    });
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = 5 * scale;
    const f = targetHeight / (size.y || 1);
    return { cloned: clonedScene, factor: f, yOffset: -box.min.y * f };
  }, [gltf, scale]);

  return <primitive object={cloned} position={[x, yOffset, z]} scale={factor} />;
}

function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 4.4, 8]} />
        <meshStandardMaterial color="#3c4148" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, 4.45, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#ffe9b0" emissive="#ffd980" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

export function preloadCityModels(): void {
  const models = new Set(CITY_BUILDINGS.map((b) => modelUrl(b.model)));
  for (const url of models) useGLTF.preload(url);
  useGLTF.preload(TREE_URL);
}
