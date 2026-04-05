import type { CelestialBodyData, OrbitalElements } from "./types";
import type { BodyState3D, Vec3 } from "./types3d";
import {
  solveKepler,
  solveKeplerHyperbolic,
  trueAnomalyFromEccentric,
  trueAnomalyFromHyperbolic,
} from "./kepler";

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

function computeOrbitalPosition3D(
  elements: OrbitalElements,
  daysSinceEpoch: number,
): Vec3 {
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

export function computeOrbitPath3D(elements: OrbitalElements, numPoints: number): Vec3[] {
  if (elements.eccentricity >= 1.0) return [];

  const points: Vec3[] = new Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * elements.period;
    points[i] = computeOrbitalPosition3D(elements, t);
  }
  return points;
}

export function computeTrailPoints3D(
  body: CelestialBodyData,
  simTime: number,
  maxRadius?: number,
): Vec3[] {
  if (!body.orbit) return [];

  const e = body.orbit.eccentricity;
  const isHyperbolic = e >= 1.0;

  let numSegments: number;
  let trailDuration: number;

  if (isHyperbolic || body.type === "probe") {
    numSegments = 150;
    trailDuration = 2000;
  } else if (body.type === "moon") {
    numSegments = 80;
    trailDuration = body.orbit.period * 0.75;
  } else {
    numSegments = 200;
    trailDuration = body.orbit.period * 0.75;
  }

  const dt = trailDuration / numSegments;
  const points: Vec3[] = [];
  const maxR = maxRadius ?? Number.POSITIVE_INFINITY;

  for (let i = 0; i <= numSegments; i++) {
    const t = simTime - i * dt;
    const position = computeOrbitalPosition3D(body.orbit, t);

    if (maxR < Number.POSITIVE_INFINITY) {
      const r = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
      if (r > maxR) break;
    }

    points.push(position);
  }

  return points;
}
