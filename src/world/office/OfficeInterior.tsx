"use client";

import { workplaceConfig } from "@/config/workplace";
import {
  ENCLOSED_ROOMS,
  ENTRANCE_DOOR_ID,
  ENTRANCE_GAP,
  BUILDING_SHELL,
  OPEN_ZONE_LABEL_POSITIONS,
} from "./officeLayout";
import { Door } from "./props/Door";
import { RoomLabel } from "./props/RoomLabel";
import { DeskCluster, type DeskSpot } from "./props/DeskCluster";
import { PlayerWorkstation } from "./props/PlayerWorkstation";
import { EmbeddedLabBench } from "./props/EmbeddedLabBench";
import { ExecutiveDeskSet, HrDeskSet, MeetingRoomFurniture, PantryFurniture } from "./props/RoomFurniture";
import { ReceptionArea } from "./props/ReceptionArea";
import type { OfficeMaterials } from "./OfficeMaterials";
import type { QualityProfile } from "@/config/quality";

const ENGINEERING_DESKS: DeskSpot[] = [
  { id: "eng-1", position: [-11, 0, -24.5] },
  { id: "eng-2", position: [-9, 0, -24.5] },
  { id: "eng-3", position: [-11, 0, -26], rotationY: Math.PI },
  { id: "eng-4", position: [-9, 0, -26], rotationY: Math.PI },
  { id: "eng-5", position: [-3, 0, -24.5] },
  { id: "eng-6", position: [-3, 0, -26], rotationY: Math.PI },
];

const TEAM_LEAD_DESKS: DeskSpot[] = [
  { id: "lead-1", position: [-12, 0, -20.5] },
  { id: "lead-2", position: [-10, 0, -20.5] },
];

function roomCenter(bounds: { minX: number; maxX: number; minZ: number; maxZ: number }): [number, number, number] {
  return [(bounds.minX + bounds.maxX) / 2, 0, (bounds.minZ + bounds.maxZ) / 2];
}

function doorPosition(room: (typeof ENCLOSED_ROOMS)[number]): [number, number, number] {
  const { bounds, doorSide } = room;
  if (doorSide === "north" || doorSide === "south") {
    return [(bounds.minX + bounds.maxX) / 2, 0, doorSide === "north" ? bounds.minZ : bounds.maxZ];
  }
  return [doorSide === "west" ? bounds.minX : bounds.maxX, 0, (bounds.minZ + bounds.maxZ) / 2];
}

function doorFacingRotation(doorSide: string): number {
  return doorSide === "east" || doorSide === "west" ? Math.PI / 2 : 0;
}

export function OfficeInterior({
  materials,
  quality,
}: {
  materials: OfficeMaterials;
  quality: QualityProfile;
}) {
  const showEmbeddedLabDetail = quality.environmentDetail !== "LOW";

  return (
    <group>
      {/* Entrance door */}
      <Door
        doorId={ENTRANCE_DOOR_ID}
        position={[ENTRANCE_GAP.center, 0, BUILDING_SHELL.maxZ]}
        materials={materials}
      />

      {/* Enclosed rooms: doors + labels + furniture */}
      {ENCLOSED_ROOMS.map((room) => (
        <group key={room.id}>
          <Door
            doorId={room.doorId}
            position={doorPosition(room)}
            facingRotationY={doorFacingRotation(room.doorSide)}
            materials={materials}
          />
          <RoomLabel text={workplaceConfig.roomLabels[room.id]} position={room.labelPosition} />
          {room.id === "executive" && <ExecutiveDeskSet center={roomCenter(room.bounds)} materials={materials} />}
          {room.id === "manager" && <ExecutiveDeskSet center={roomCenter(room.bounds)} materials={materials} />}
          {room.id === "meeting" && <MeetingRoomFurniture center={roomCenter(room.bounds)} materials={materials} />}
          {room.id === "hr" && <HrDeskSet center={roomCenter(room.bounds)} materials={materials} />}
          {room.id === "pantry" && <PantryFurniture center={roomCenter(room.bounds)} materials={materials} />}
        </group>
      ))}

      {/* Open-plan zone labels */}
      {Object.entries(OPEN_ZONE_LABEL_POSITIONS).map(([roomId, position]) => (
        <RoomLabel key={roomId} text={workplaceConfig.roomLabels[roomId as keyof typeof workplaceConfig.roomLabels]} position={position!} />
      ))}

      {/* Reception / lobby */}
      <ReceptionArea center={[0, 0, -16.5]} materials={materials} />

      {/* Engineering + team-lead open desks */}
      <DeskCluster desks={ENGINEERING_DESKS} materials={materials} />
      <DeskCluster desks={TEAM_LEAD_DESKS} materials={materials} />

      {/* Embedded systems lab */}
      <EmbeddedLabBench position={[7, 0, -23]} materials={materials} />
      {showEmbeddedLabDetail && <EmbeddedLabBench position={[9.5, 0, -25.5]} materials={materials} />}

      {/* Player workstation */}
      <PlayerWorkstation materials={materials} />
    </group>
  );
}
