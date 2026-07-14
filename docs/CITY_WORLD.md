# City World & Vehicles

The 3D world (`/city` route) is now an open city block surrounding the
office: roads, sidewalks, buildings, trees, street lamps, ambient
traffic, walking pedestrians, and drivable vehicles (the player's own
car and bike parked on the office forecourt, plus street-parked
variety — **every parked vehicle is drivable**).

## Modules

| Module | Role |
|---|---|
| `src/world/city/cityLayout.ts` | Pure placement data: roads, sidewalks, building lots (with collision footprints), trees, lamps, city bounds. Unit-tested (`cityLayout.test.ts`) for no overlap with the office block or road surfaces. |
| `src/world/city/CityEnvironment.tsx` | Renders ground/roads/sidewalks/lane markings procedurally, and buildings/trees from Kenney City Kit GLBs (scale-normalised to the layout's authoritative footprints). Also owns scene lighting (replacing the Milestone-1 `TestEnvironment`). |
| `src/world/city/pathLoop.ts` | Pure closed-polyline helper (`advanceAlongLoop`) shared by traffic and pedestrians; unit-tested. |
| `src/world/city/TrafficVehicles.tsx` | Non-enterable ambient cars on two opposite-direction lane loops, avoiding the curb parking bays. |
| `src/world/city/CityPedestrians.tsx` | Renderpeople walkers on sidewalk loops ("nathan" walk clip) plus stationary "sophia" idlers — the free tier's clip constraints decide who walks (see `docs/NPC_SYSTEM.md` "Avatar variation"). |
| `src/vehicles/vehiclePhysics.ts` | Pure arcade drive model (`stepVehicle`): throttle/brake/reverse, speed-scaled steering that flips in reverse, per-class specs (car/sports/truck/motorcycle). Unit-tested. |
| `src/vehicles/vehicleConfig.ts` | Model catalogue (11 Kenney vehicles) + parked placements + enter radius. |
| `src/vehicles/VehicleModel.tsx` | GLB instancing: clones the drei-cached scene, normalises to real-world length, yaws 180° (Kenney models face local −Z). |
| `src/vehicles/CityVehicles.tsx` | Runtime: nearest-vehicle prompt, enter/exit, drive loop, circle-vs-AABB collision against the same walls as the player, exit-spot search. |
| `src/state/useVehicleStore.ts` | Zustand flags only (`drivingVehicleId`, nearby prompt); per-frame transforms stay in refs. |

## Driving flow

1. Walk within 3.2 m of a parked vehicle → HUD shows `E — Drive …`
   (mobile: a `DRIVE` context button).
2. `E` enters: the on-foot avatar is hidden (not unmounted), input is
   rerouted to `stepVehicle` (joystick/WASD: forward/back = throttle/
   brake-reverse, left/right = steer), and the existing camera follows
   the vehicle because `CityVehicles` writes the shared player
   transform each frame.
3. `E` again exits: an unblocked spot is searched (driver's side →
   passenger side → behind); the player teleports there via
   `PlayerCapsule`'s `consumeTeleport` hook. If every spot is blocked,
   the exit is refused rather than clipping the player into a wall.

Office interaction (`InteractionController`) is unmounted while
driving, so `E` can't simultaneously trigger a door/chair and the
vehicle exit.

## Collision & bounds

Vehicles resolve against the union of office walls and one AABB per
city building (`buildCityCollisionWalls`), with speed damped on impact;
both player and vehicles are clamped inside `CITY_BOUNDS`. Sidewalks,
trees, and lamps are intentionally non-colliding (arcade tradeoff).

## Performance

On the `LOW` quality profile the city renders 4 pedestrians and 2
traffic cars instead of 8/4 (see `docs/PERFORMANCE.md`). All GLBs
total ≈3.4 MB.

## Asset licensing

All city/vehicle models are free and license-verified — Kenney City
Kit & Car Kit (CC0) and Kenney Starter Kit Racing motorcycle (MIT):
see `docs/ASSET_PIPELINE.md` "Kenney asset attribution" and the
LICENSE files committed in `public/models/vehicles/` and
`public/models/city/`. Nothing was purchased; no unlicensed content is
used.

## Known limitations

- Traffic cars are visual only: they don't avoid the player or each
  other, and driving through them has no effect (no damage model —
  deliberately unlike GTA).
- The single free Renderpeople walk/idle clips constrain pedestrian
  variety, exactly as documented for office NPCs.
- No visual/screenshot verification is possible in this sandbox; the
  layout is verified by unit tests and the quality gate, not by
  rendered frames.
