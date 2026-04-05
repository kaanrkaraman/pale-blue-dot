import { computeOrbitalPosition } from "../core/kepler";
import type { CelestialBodyData, OrbitalElements, OrbitPath, Vec2 } from "../core/types";

const PLANET_ORBIT_POINTS = 360;
const MOON_ORBIT_POINTS = 120;

const PLANET_TRAIL_SEGMENTS = 300;
const MOON_TRAIL_SEGMENTS = 120;
const PROBE_TRAIL_SEGMENTS = 250;
const COMET_TRAIL_SEGMENTS = 1500;

const TRAIL_FRACTION = 0.75;
const HYPERBOLIC_TRAIL_DAYS = 2000;
const MAX_COMET_TRAIL_DAYS = 50 * 365.25; // 50 years

export function precomputeAllOrbits(bodies: CelestialBodyData[]): Map<string, OrbitPath> {
  const orbits = new Map<string, OrbitPath>();

  for (const body of bodies) {
    if (!body.orbit) continue;

    // Use significantly more points for highly eccentric orbits to keep them smooth
    let numPoints = body.type === "moon" ? MOON_ORBIT_POINTS : PLANET_ORBIT_POINTS;
    const e = body.orbit.eccentricity;
    if (e > 0.98) numPoints *= 8;
    else if (e > 0.9) numPoints *= 4;
    else if (e > 0.7) numPoints *= 2;

    const points = new Float64Array(numPoints * 2);
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * body.orbit.period;
      const { position } = computeOrbitalPosition(body.orbit, t);
      points[i * 2] = position.x;
      points[i * 2 + 1] = position.y;
    }

    orbits.set(body.id, { bodyId: body.id, points });
  }

  return orbits;
}

function computeTrailPoints(body: CelestialBodyData, simTime: number, maxRadius?: number): Float64Array {
  if (!body.orbit) return new Float64Array(0);

  const e = body.orbit.eccentricity;
  const isHyperbolic = e >= 1.0;
  const isComet = body.type === "comet";

  let numSegments: number;
  let trailDuration: number;

  if (isHyperbolic || body.type === "probe") {
    numSegments = PROBE_TRAIL_SEGMENTS;
    trailDuration = HYPERBOLIC_TRAIL_DAYS;
  } else if (body.type === "moon") {
    numSegments = MOON_TRAIL_SEGMENTS;
    trailDuration = body.orbit.period * TRAIL_FRACTION;
  } else if (isComet) {
    numSegments = COMET_TRAIL_SEGMENTS;
    trailDuration = Math.min(body.orbit.period * TRAIL_FRACTION, MAX_COMET_TRAIL_DAYS);
  } else {
    numSegments = PLANET_TRAIL_SEGMENTS;
    trailDuration = body.orbit.period * TRAIL_FRACTION;
  }

  const numPoints = numSegments + 1;
  const points = new Float64Array(numPoints * 2);
  const maxR = maxRadius ?? Infinity;

  let actualPoints = 0;
  for (let i = 0; i < numPoints; i++) {
    const progress = i / numSegments;
    const biasedProgress = isComet ? progress ** 1.15 : progress;
    const t = simTime - trailDuration * biasedProgress;

    const { position } = computeOrbitalPosition(body.orbit, t);

    if (maxR < Infinity) {
      const r = Math.sqrt(position.x ** 2 + position.y ** 2);
      if (r > maxR) break;
    }

    points[i * 2] = position.x;
    points[i * 2 + 1] = position.y;
    actualPoints++;
  }

  return actualPoints === numPoints ? points : points.slice(0, actualPoints * 2);
}

const trailCache = new Map<string, { simTime: number; maxRadius: number | undefined; points: Float64Array }>();

export function computeTrailPointsCached(body: CelestialBodyData, simTime: number, maxRadius?: number): Float64Array {
  const cached = trailCache.get(body.id);
  if (cached && cached.maxRadius === maxRadius) {
    if (!body.orbit) return new Float64Array(0);

    const e = body.orbit.eccentricity;
    const isHyperbolic = e >= 1.0;
    const isComet = body.type === "comet";

    let numSegments: number;
    let trailDuration: number;

    if (isHyperbolic || body.type === "probe") {
      numSegments = PROBE_TRAIL_SEGMENTS;
      trailDuration = HYPERBOLIC_TRAIL_DAYS;
    } else if (body.type === "moon") {
      numSegments = MOON_TRAIL_SEGMENTS;
      trailDuration = body.orbit.period * TRAIL_FRACTION;
    } else if (isComet) {
      numSegments = COMET_TRAIL_SEGMENTS;
      trailDuration = Math.min(body.orbit.period * TRAIL_FRACTION, MAX_COMET_TRAIL_DAYS);
    } else {
      numSegments = PLANET_TRAIL_SEGMENTS;
      trailDuration = body.orbit.period * TRAIL_FRACTION;
    }

    const threshold = (trailDuration / numSegments) * 0.2;
    if (Math.abs(simTime - cached.simTime) < threshold) {
      return cached.points;    }
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
  points: Float64Array,
  parentScreenX: number,
  parentScreenY: number,
  kmPerPixel: number,
  r: number,
  g: number,
  b: number,
  maxAlpha: number,
  lineWidth: number = 1.2,
  currentBodyPos?: Vec2,
): void {
  const numPoints = points.length / 2;
  if (numPoints < 1 && !currentBodyPos) return;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  const invKm = 1 / kmPerPixel;
  let lastQuantized = -1;

  let startX = 0;
  let startY = 0;
  let hasTip = false;

  if (currentBodyPos) {
    startX = parentScreenX + currentBodyPos.x * invKm;
    startY = parentScreenY - currentBodyPos.y * invKm;
    hasTip = true;
  } else if (numPoints >= 1) {
    startX = parentScreenX + points[0] * invKm;
    startY = parentScreenY - points[1] * invKm;
  }

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints || 1);
    const alpha = maxAlpha * (1 - progress) ** 1.5;
    if (alpha < 0.005) break;

    const quantized = Math.round(alpha * 40) / 40;

    const x0 = i === 0 && hasTip ? startX : parentScreenX + points[i * 2] * invKm;
    const y0 = i === 0 && hasTip ? startY : parentScreenY - points[i * 2 + 1] * invKm;

    if (quantized !== lastQuantized) {
      if (lastQuantized >= 0) ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r},${g},${b},${quantized})`;
      ctx.moveTo(x0, y0);
      lastQuantized = quantized;
    }

    if (i < numPoints - 1) {
      ctx.lineTo(parentScreenX + points[(i + 1) * 2] * invKm, parentScreenY - points[(i + 1) * 2 + 1] * invKm);
    }
  }

  if (lastQuantized >= 0) ctx.stroke();
}

export function isOrbitVisible(elements: OrbitalElements, kmPerPixel: number, canvasWidth: number): boolean {
  const representativeRadius =
    elements.eccentricity >= 1.0
      ? Math.abs(elements.semiMajorAxis) * (elements.eccentricity - 1)
      : elements.semiMajorAxis;

  const orbitRadiusPx = representativeRadius / kmPerPixel;
  if (orbitRadiusPx < 3) return false;
  if (orbitRadiusPx > canvasWidth * 50) return false;
  return true;
}
