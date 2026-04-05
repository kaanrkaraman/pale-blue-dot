import type { BodyType, CameraState, Vec2 } from "../core/types";

const MIN_KM_PER_PX = 0.5;
const MAX_KM_PER_PX = 20_000_000_000;
export const DEEP_ZOOM_THRESHOLD = 25_000_000;
const ZOOM_FACTOR = 1.15;

export function worldToScreen(
  worldPos: Vec2,
  camera: CameraState,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number } {
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  return {
    x: cx + (worldPos.x - camera.center.x) / camera.kmPerPixel,
    y: cy - (worldPos.y - camera.center.y) / camera.kmPerPixel, // y-flip for screen coords
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: CameraState,
  canvasWidth: number,
  canvasHeight: number,
): Vec2 {
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  return {
    x: camera.center.x + (screenX - cx) * camera.kmPerPixel,
    y: camera.center.y - (screenY - cy) * camera.kmPerPixel,
  };
}

export function applyZoom(camera: CameraState, delta: number): CameraState {
  const factor = delta > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
  const newKmPerPx = Math.max(MIN_KM_PER_PX, Math.min(MAX_KM_PER_PX, camera.kmPerPixel * factor));
  return { ...camera, kmPerPixel: newKmPerPx };
}

export function getAutoZoomLevel(
  bodyType: BodyType,
  hasMoons: boolean,
  moonMaxSemiMajorAxis?: number,
  orbitSemiMajorAxis?: number,
): number {
  if (bodyType === "star") {
    return 500_000;
  }

  if (hasMoons && moonMaxSemiMajorAxis) {
    // Farthest moon orbit fills ~1/3 of screen (~250px of ~800px half-screen)
    return (moonMaxSemiMajorAxis * 3) / 400;
  }

  if (orbitSemiMajorAxis) {
    return orbitSemiMajorAxis / 300;
  }

  return 10_000;
}

export function clampZoom(kmPerPixel: number): number {
  return Math.max(MIN_KM_PER_PX, Math.min(MAX_KM_PER_PX, kmPerPixel));
}
