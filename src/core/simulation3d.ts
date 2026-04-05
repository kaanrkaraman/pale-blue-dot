import { solveKepler, solveKeplerHyperbolic, trueAnomalyFromEccentric, trueAnomalyFromHyperbolic } from "./kepler";
import type { CelestialBodyData, OrbitalElements } from "./types";
import type { BodyState3D, Vec3 } from "./types3d";

const DEG_TO_RAD = Math.PI / 180;
const TWO_PI = 2 * Math.PI;
const SECONDS_PER_DAY = 86400;

// R_z(Omega) * R_x(i) * R_z(omega); z = sin(i) * (sin(omega)*xOrbital + cos(omega)*yOrbital)
function orbitalToEcliptic3D(
  xOrbital: number,
  yOrbital: number,
  iRad: number,
  omegaRad: number,
  OmegaRad: number,
): Vec3 {
  const cosOmega = Math.cos(OmegaRad);
  const sinOmega = Math.sin(OmegaRad);
  const cosOmegaSmall = Math.cos(omegaRad);
  const sinOmegaSmall = Math.sin(omegaRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);

  // u, v are the intermediate coords after R_z(omega)
  const u = cosOmegaSmall * xOrbital - sinOmegaSmall * yOrbital;
  const v = sinOmegaSmall * xOrbital + cosOmegaSmall * yOrbital;

  // After R_x(i): (u, cosI*v, sinI*v)
  // After R_z(Omega):
  const x = cosOmega * u - sinOmega * cosI * v;
  const y = sinOmega * u + cosOmega * cosI * v;
  const z = sinI * v;

  return { x, y, z };
}

function computeOrbitalPosition3D(elements: OrbitalElements, daysSinceEpoch: number): Vec3 {
  const {
    semiMajorAxis: a,
    eccentricity: e,
    inclination: iDeg,
    argPerihelion: omegaDeg,
    longAscNode: OmegaDeg,
    meanAnomalyEpoch: M0Deg,
    period,
    mu,
  } = elements;

  const iRad = iDeg * DEG_TO_RAD;
  const omegaRad = omegaDeg * DEG_TO_RAD;
  const OmegaRad = OmegaDeg * DEG_TO_RAD;
  const M0Rad = M0Deg * DEG_TO_RAD;

  let nu: number;
  let r: number;

  if (e >= 1.0) {
    const muVal = mu ?? 1.32712440018e11;
    const absA = Math.abs(a);
    const nRadPerSec = Math.sqrt(muVal / (absA * absA * absA));
    const nRadPerDay = nRadPerSec * SECONDS_PER_DAY;
    const M = M0Rad + nRadPerDay * daysSinceEpoch;
    const H = solveKeplerHyperbolic(M, e);
    nu = trueAnomalyFromHyperbolic(H, e);
    r = absA * (e * Math.cosh(H) - 1);
  } else {
    const n = TWO_PI / period;
    const M = M0Rad + n * daysSinceEpoch;
    const E = solveKepler(M, e);
    nu = trueAnomalyFromEccentric(E, e);
    r = a * (1 - e * Math.cos(E));
  }

  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);

  return orbitalToEcliptic3D(xOrbital, yOrbital, iRad, omegaRad, OmegaRad);
}

export function computeAllPositions3D(
  daysSinceEpoch: number,
  bodies: CelestialBodyData[],
  centerBodyId: string,
): Map<string, BodyState3D> {
  const states = new Map<string, BodyState3D>();

  const centerBody = bodies.find((b) => b.id === centerBodyId);
  if (centerBody) {
    states.set(centerBodyId, {
      id: centerBodyId,
      position: { x: 0, y: 0, z: 0 },
    });
  }

  for (const body of bodies) {
    if (body.id === centerBodyId) continue;
    if (!body.orbit) continue;

    const position = computeOrbitalPosition3D(body.orbit, daysSinceEpoch);

    let absolutePos: Vec3;

    if (body.parentId && body.parentId !== centerBodyId) {
      const parentState = states.get(body.parentId);
      if (parentState) {
        absolutePos = {
          x: parentState.position.x + position.x,
          y: parentState.position.y + position.y,
          z: parentState.position.z + position.z,
        };
      } else {
        absolutePos = position;
      }
    } else {
      absolutePos = position;
    }

    states.set(body.id, {
      id: body.id,
      position: absolutePos,
    });
  }

  return states;
}

export function computeOrbitPath3D(elements: OrbitalElements, numPoints: number): Float32Array {
  if (elements.eccentricity >= 1.0) return new Float32Array(0);

  const {
    semiMajorAxis: a,
    eccentricity: e,
    inclination: iDeg,
    argPerihelion: omegaDeg,
    longAscNode: OmegaDeg,
  } = elements;

  const iRad = iDeg * DEG_TO_RAD;
  const omegaRad = omegaDeg * DEG_TO_RAD;
  const OmegaRad = OmegaDeg * DEG_TO_RAD;
  const b = a * Math.sqrt(1 - e * e);

  const points = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    const E = (i / numPoints) * TWO_PI;
    const xOrbital = a * (Math.cos(E) - e);
    const yOrbital = b * Math.sin(E);
    const pos = orbitalToEcliptic3D(xOrbital, yOrbital, iRad, omegaRad, OmegaRad);
    points[i * 3] = pos.x;
    points[i * 3 + 1] = pos.y;
    points[i * 3 + 2] = pos.z;
  }
  return points;
}

const MAX_COMET_TRAIL_DAYS = 50 * 365.25;

function computeTrailPoints3D(body: CelestialBodyData, simTime: number, maxRadius?: number): Float32Array {
  if (!body.orbit) return new Float32Array(0);

  const e = body.orbit.eccentricity;
  const isHyperbolic = e >= 1.0;
  const isComet = body.type === "comet";

  let numSegments: number;
  let trailDuration: number;

  if (isHyperbolic || body.type === "probe") {
    numSegments = 250;
    trailDuration = 2000;
  } else if (body.type === "moon") {
    numSegments = 120;
    trailDuration = body.orbit.period * 0.75;
  } else if (isComet) {
    numSegments = 1500;
    trailDuration = Math.min(body.orbit.period * 0.75, MAX_COMET_TRAIL_DAYS);
  } else {
    numSegments = 300;
    trailDuration = body.orbit.period * 0.75;
  }

  const numPoints = numSegments + 1;
  const points = new Float32Array(numPoints * 3);
  const maxR = maxRadius ?? Number.POSITIVE_INFINITY;

  let actualPoints = 0;
  for (let i = 0; i < numPoints; i++) {
    const progress = i / numSegments;
    const biasedProgress = isComet ? progress ** 1.15 : progress;
    const t = simTime - trailDuration * biasedProgress;
    const position = computeOrbitalPosition3D(body.orbit, t);

    if (maxR < Number.POSITIVE_INFINITY) {
      const r = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
      if (r > maxR) break;
    }

    points[i * 3] = position.x;
    points[i * 3 + 1] = position.y;
    points[i * 3 + 2] = position.z;
    actualPoints++;
  }

  return actualPoints === numPoints ? points : points.slice(0, actualPoints * 3);
}

const trailCache3D = new Map<string, { simTime: number; maxRadius: number | undefined; points: Float32Array }>();

export function computeTrailPoints3DCached(body: CelestialBodyData, simTime: number, maxRadius?: number): Float32Array {
  const cached = trailCache3D.get(body.id);
  if (cached && cached.maxRadius === maxRadius) {
    if (!body.orbit) return new Float32Array(0);

    const e = body.orbit.eccentricity;
    const isHyperbolic = e >= 1.0;
    const isComet = body.type === "comet";

    let numSegments: number;
    let trailDuration: number;

    if (isHyperbolic || body.type === "probe") {
      numSegments = 250;
      trailDuration = 2000;
    } else if (body.type === "moon") {
      numSegments = 120;
      trailDuration = body.orbit.period * 0.75;
    } else if (isComet) {
      numSegments = 1500;
      trailDuration = Math.min(body.orbit.period * 0.75, MAX_COMET_TRAIL_DAYS);
    } else {
      numSegments = 300;
      trailDuration = body.orbit.period * 0.75;
    }

    const threshold = (trailDuration / numSegments) * 0.2;
    if (Math.abs(simTime - cached.simTime) < threshold) {
      return cached.points;
    }
  }
  const points = computeTrailPoints3D(body, simTime, maxRadius);
  trailCache3D.set(body.id, { simTime, maxRadius, points });
  return points;
}

export function clearTrailCache3D() {
  trailCache3D.clear();
}
