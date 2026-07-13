"use client";

import { Text } from "@react-three/drei";

/**
 * Texture/SDF-rendered 3D text label (drei's Text, backed by
 * troika-three-text) sized for readability from a normal walking
 * distance and on large displays — see docs/OFFICE_WORLD.md "Room
 * labels".
 */
export function RoomLabel({
  text,
  position,
  rotationY = 0,
}: {
  text: string;
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <Text
      position={position}
      rotation={[0, rotationY, 0]}
      fontSize={0.34}
      color="#101317"
      outlineWidth={0.015}
      outlineColor="#ffffff"
      anchorX="center"
      anchorY="middle"
      maxWidth={4}
    >
      {text}
    </Text>
  );
}
