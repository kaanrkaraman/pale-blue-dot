import { computeOrbitalPosition, computeOrbitPath } from "../core/kepler";
import type { CelestialBodyData, OrbitalElements, OrbitPath, Vec2 } from "../core/types";

const PLANET_ORBIT_POINTS = 360;
const MOON_ORBIT_POINTS = 120;

const PLANET_TRAIL_SEGMENTS = 200;
const MOON_TRAIL_SEGMENTS = 80;
const PROBE_TRAIL_SEGMENTS = 150;

const TRAIL_FRACTION = 0.75;
const HYPERBOLIC_TRAIL_DAYS = 2000;

export function precomputeAllOrbits(bodies: CelestialBodyData[]): Map<string, OrbitPath> {
  const orbits = new Map<string, OrbitPath>();

  for (const body of bodies) {
    if (!body.orbit) continue;

    const numPoints = body.type === "moon" ? MOON_ORBIT_POINTS : PLANET_ORBIT_POINTS;
    const points = computeOrbitPath(body.orbit, numPoints);

    orbits.set(body.id, { bodyId: body.id, points });
  }

  return orbits;
}

function computeTrailPoints(body: CelestialBodyData, simTime: number, maxRadius?: number): Vec2[] {
  if (!body.orbit) return [];

  const e = body.orbit.eccentricity;
  const isHyperbolic = e >= 1.0;

  let numSegments: number;
  let trailDuration: number;

  if (isHyperbolic || body.type === "probe") {
    numSegments = PROBE_TRAIL_SEGMENTS;
    trailDuration = HYPERBOLIC_TRAIL_DAYS;
  } else if (body.type === "moon") {
    numSegments = MOON_TRAIL_SEGMENTS;
    trailDuration = body.orbit.period * TRAIL_FRACTION;
  } else {
    numSegments = PLANET_TRAIL_SEGMENTS;
    trailDuration = body.orbit.period * TRAIL_FRACTION;
  }

  const dt = trailDuration / numSegments;
  const points: Vec2[] = [];
  const maxR = maxRadius ?? Infinity;

  for (let i = 0; i <= numSegments; i++) {
    const t = simTime - i * dt;
    const { position } = computeOrbitalPosition(body.orbit, t);

    if (maxR < Infinity) {
      const r = Math.sqrt(position.x ** 2 + position.y ** 2);
      if (r > maxR) break;
    }

    points.push(position);
  }

  return points;
}

const trailCache = new Map<string, { simTime: number; maxRadius: number | undefined; points: Vec2[] }>();

export function computeTrailPointsCached(body: CelestialBodyData, simTime: number, maxRadius?: number): Vec2[] {
  const cached = trailCache.get(body.id);
  if (cached && cached.maxRadius === maxRadius) {
    const e = body.orbit?.eccentricity ?? 0;
    const isHyperbolic = e >= 1.0;
    let trailDuration: number;
    let numSegments: number;
    if (isHyperbolic || body.type === "probe") {
      numSegments = PROBE_TRAIL_SEGMENTS;
      trailDuration = HYPERBOLIC_TRAIL_DAYS;
    } else if (body.type === "moon") {
      numSegments = MOON_TRAIL_SEGMENTS;
      trailDuration = (body.orbit?.period ?? 27) * TRAIL_FRACTION;
    } else {
      numSegments = PLANET_TRAIL_SEGMENTS;
      trailDuration = (body.orbit?.period ?? 365) * TRAIL_FRACTION;
    }
    // Recompute only when simTime has advanced by at least one segment
    const threshold = trailDuration / numSegments;
    if (Math.abs(simTime - cached.simTime) < threshold) {
      return cached.points;
    }
  }
  const points = computeTrailPoints(body, simTime, maxRadius);
  trailCache.set(body.id, { simTime, maxRadius, points });
  return points;
}

export function clearTrailCache() {
  trailCache.clear();
}

export function drawTrail(
  ctx: CanvasRenderingContext2D,
  points: Vec2[],
  parentScreenX: number,
  parentScreenY: number,
  kmPerPixel: number,
  r: number,
  g: number,
  b: number,
  maxAlpha: number,
  lineWidth: number = 1.2,
): void {
  if (points.length < 2) return;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  const total = points.length - 1;
  const invKm = 1 / kmPerPixel;
  let lastQuantized = -1;

  for (let i = 0; i < total; i++) {
    const progress = i / total;
    const alpha = maxAlpha * (1 - progress) ** 1.5;
    if (alpha < 0.005) break;

    // Quantize alpha to reduce draw calls from ~200 to ~10-15
    const quantized = Math.round(alpha * 40) / 40;

    const p0 = points[i];
    const x0 = parentScreenX + p0.x * invKm;
    const y0 = parentScreenY - p0.y * invKm;

    if (quantized !== lastQuantized) {
      if (lastQuantized >= 0) ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r},${g},${b},${quantized})`;
      ctx.moveTo(x0, y0);
      lastQuantized = quantized;
    }

    const p1 = points[i + 1];
    ctx.lineTo(parentScreenX + p1.x * invKm, parentScreenY - p1.y * invKm);
  }

  if (lastQuantized >= 0) ctx.stroke();
}

export function isOrbitVisible(elements: OrbitalElements, kmPerPixel: number, canvasWidth: number): boolean {
  // For hyperbolic orbits, use perihelion distance as representative size
  const representativeRadius =
    elements.eccentricity >= 1.0
      ? Math.abs(elements.semiMajorAxis) * (elements.eccentricity - 1)
      : elements.semiMajorAxis;

  const orbitRadiusPx = representativeRadius / kmPerPixel;
  if (orbitRadiusPx < 3) return false;
  if (orbitRadiusPx > canvasWidth * 50) return false;
  return true;
}
