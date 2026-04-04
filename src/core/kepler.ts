import type { OrbitalElements, Vec2 } from "./types";

const DEG_TO_RAD = Math.PI / 180;
const TWO_PI = 2 * Math.PI;
const SECONDS_PER_DAY = 86400;

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E
 * using Newton-Raphson iteration. For elliptical orbits (e < 1).
 */
export function solveKepler(meanAnomaly: number, eccentricity: number): number {
  let M = meanAnomaly % TWO_PI;
  if (M < 0) M += TWO_PI;

  const e = eccentricity;
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));

  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }

  return E;
}

/**
 * Solve the hyperbolic Kepler equation M = e*sinh(H) - H
 * for hyperbolic anomaly H using Newton-Raphson. For hyperbolic orbits (e >= 1).
 */
export function solveKeplerHyperbolic(meanAnomaly: number, eccentricity: number): number {
  const M = meanAnomaly;
  const e = eccentricity;

  // Initial guess: for small M use M, for large M use sign(M)*ln(2|M|/e + 1.8)
  let H = Math.abs(M) < 1 ? M : Math.sign(M) * Math.log((2 * Math.abs(M)) / e + 1.8);

  for (let i = 0; i < 30; i++) {
    const dH = (e * Math.sinh(H) - H - M) / (e * Math.cosh(H) - 1);
    H -= dH;
    if (Math.abs(dH) < 1e-12) break;
  }

  return H;
}

/**
 * Compute true anomaly from eccentric anomaly (elliptical)
 */
export function trueAnomalyFromEccentric(E: number, e: number): number {
  const halfE = E / 2;
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(halfE), Math.sqrt(1 - e) * Math.cos(halfE));
}

/**
 * Compute true anomaly from hyperbolic anomaly
 */
export function trueAnomalyFromHyperbolic(H: number, e: number): number {
  return 2 * Math.atan2(Math.sqrt(e + 1) * Math.sinh(H / 2), Math.sqrt(e - 1) * Math.cosh(H / 2));
}

/**
 * Rotate a position from the orbital plane to the ecliptic plane (2D projection).
 * This is the standard R_z(Ω) * R_x(i) * R_z(ω) rotation, taking x,y of the result.
 */
function orbitalToEcliptic(xOrbital: number, yOrbital: number, iRad: number, omegaRad: number, OmegaRad: number): Vec2 {
  const cosOmega = Math.cos(OmegaRad);
  const sinOmega = Math.sin(OmegaRad);
  const cosOmegaSmall = Math.cos(omegaRad);
  const sinOmegaSmall = Math.sin(omegaRad);
  const cosI = Math.cos(iRad);

  const x =
    (cosOmega * cosOmegaSmall - sinOmega * sinOmegaSmall * cosI) * xOrbital +
    (-cosOmega * sinOmegaSmall - sinOmega * cosOmegaSmall * cosI) * yOrbital;

  const y =
    (sinOmega * cosOmegaSmall + cosOmega * sinOmegaSmall * cosI) * xOrbital +
    (-sinOmega * sinOmegaSmall + cosOmega * cosOmegaSmall * cosI) * yOrbital;

  return { x, y };
}

/**
 * Compute 2D ecliptic-projected position from orbital elements at a given time.
 * Supports both elliptical (e < 1) and hyperbolic (e >= 1) orbits.
 *
 * @param elements - Keplerian orbital elements
 * @param daysSinceEpoch - Julian days since J2000
 * @returns position in km and true anomaly in radians
 */
export function computeOrbitalPosition(
  elements: OrbitalElements,
  daysSinceEpoch: number,
): { position: Vec2; trueAnomaly: number; orbitalRadius: number } {
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
    // === HYPERBOLIC ORBIT ===
    // a is negative, mu is required
    const muVal = mu ?? 1.32712440018e11; // fallback to Sun's GM
    const absA = Math.abs(a);
    // Mean motion in rad/s, then convert to rad/day
    const nRadPerSec = Math.sqrt(muVal / (absA * absA * absA));
    const nRadPerDay = nRadPerSec * SECONDS_PER_DAY;

    const M = M0Rad + nRadPerDay * daysSinceEpoch;
    const H = solveKeplerHyperbolic(M, e);
    nu = trueAnomalyFromHyperbolic(H, e);
    // r = |a| * (e * cosh(H) - 1) for hyperbolic
    r = absA * (e * Math.cosh(H) - 1);
  } else {
    // === ELLIPTICAL ORBIT ===
    const n = TWO_PI / period;
    const M = M0Rad + n * daysSinceEpoch;
    const E = solveKepler(M, e);
    nu = trueAnomalyFromEccentric(E, e);
    r = a * (1 - e * Math.cos(E));
  }

  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);

  const position = orbitalToEcliptic(xOrbital, yOrbital, iRad, omegaRad, OmegaRad);

  return { position, trueAnomaly: nu, orbitalRadius: r };
}

/**
 * Compute a full orbit path as an array of points (elliptical only).
 * For hyperbolic orbits (e >= 1), returns an empty array.
 */
export function computeOrbitPath(elements: OrbitalElements, numPoints: number): Vec2[] {
  if (elements.eccentricity >= 1.0) return [];

  const points: Vec2[] = new Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * elements.period;
    const { position } = computeOrbitalPosition(elements, t);
    points[i] = position;
  }
  return points;
}

/**
 * Compute orbital velocity in km/s.
 * For elliptical: mean orbital velocity from circumference/period.
 * For hyperbolic: vis-viva equation at a reference distance.
 */
export function orbitalVelocity(elements: OrbitalElements, r?: number): number {
  const { semiMajorAxis: a, eccentricity: e, period, mu } = elements;

  if (e >= 1.0) {
    // Vis-viva: v = sqrt(mu * (2/r + 1/|a|))
    const muVal = mu ?? 1.32712440018e11;
    const absA = Math.abs(a);
    const rVal = r ?? absA * (e - 1);
    return Math.sqrt(muVal * (2 / rVal + 1 / absA));
  }

  // Elliptical: mean velocity
  const circumference = TWO_PI * a * Math.sqrt(1 - e ** 2);
  const periodSeconds = period * SECONDS_PER_DAY;
  return circumference / periodSeconds;
}
