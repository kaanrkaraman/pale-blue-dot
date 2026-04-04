import { computeOrbitalPosition, computeOrbitPath } from "../core/kepler";
import type { CelestialBodyData, OrbitalElements, OrbitPath, Vec2 } from "../core/types";

const PLANET_ORBIT_POINTS = 360;
const MOON_ORBIT_POINTS = 120;

const PLANET_TRAIL_SEGMENTS = 200;
const MOON_TRAIL_SEGMENTS = 80;
const PROBE_TRAIL_SEGMENTS = 150;

const TRAIL_FRACTION = 0.75;
const HYPERBOLIC_TRAIL_DAYS = 2000;

/** Hyperbolic orbits (e >= 1) get empty arrays; use trails instead. */
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

/** Returns parent-centric positions from newest (index 0) to oldest. */
export function computeTrailPoints(body: CelestialBodyData, simTime: number, maxRadius?: number): Vec2[] {
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

    // Clip points beyond max radius for hyperbolic orbits
    if (maxR < Infinity) {
      const r = Math.sqrt(position.x ** 2 + position.y ** 2);
      if (r > maxR) break;
    }

    points.push(position);
  }

  return points;
}

/** Points go from newest (index 0, brightest) to oldest (faded out). */
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

  for (let i = 0; i < total; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    const progress = i / total;
    const alpha = maxAlpha * (1 - progress) ** 1.5;

    if (alpha < 0.005) break;

    const x0 = parentScreenX + p0.x / kmPerPixel;
    const y0 = parentScreenY - p0.y / kmPerPixel;
    const x1 = parentScreenX + p1.x / kmPerPixel;
    const y1 = parentScreenY - p1.y / kmPerPixel;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.stroke();
  }
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
