import type { Vec3 } from "../core/types3d";

/** 1 scene unit = 1,000,000 km. Keeps values manageable for Three.js float precision. */
export const KM_TO_SCENE = 1 / 1_000_000;

/**
 * Convert ecliptic coordinates (km) to Three.js coordinates (scene units).
 * Ecliptic: X-right, Y-forward-in-plane, Z-up (out-of-plane)
 * Three.js: X-right, Y-up, Z-toward-camera (negative forward)
 */
export function toThreePos(pos: Vec3): [number, number, number] {
  return [
    pos.x * KM_TO_SCENE,
    pos.z * KM_TO_SCENE,
    -pos.y * KM_TO_SCENE,
  ];
}

export function toThreeRadius(radiusKm: number, minSceneUnits = 0): number {
  return Math.max(radiusKm * KM_TO_SCENE, minSceneUnits);
}

export const MIN_DISPLAY = {
  star: 2.0,
  planet: 0.4,
  "dwarf-planet": 0.3,
  moon: 0.15,
  probe: 0.12,
} as const;

export const MIN_REAL = {
  star: 0.5,
  planet: 0.02,
  "dwarf-planet": 0.02,
  moon: 0.01,
  probe: 0.06,
} as const;
