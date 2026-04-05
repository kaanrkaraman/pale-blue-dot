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

export function trueAnomalyFromEccentric(E: number, e: number): number {
  const halfE = E / 2;
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(halfE), Math.sqrt(1 - e) * Math.cos(halfE));
}

export function trueAnomalyFromHyperbolic(H: number, e: number): number {
  return 2 * Math.atan2(Math.sqrt(e + 1) * Math.sinh(H / 2), Math.sqrt(e - 1) * Math.cosh(H / 2));
}

// R_z(Ω) * R_x(i) * R_z(ω) rotation, projected to x,y
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

export function computeOrbitPath(elements: OrbitalElements, numPoints: number): Vec2[] {
  if (elements.eccentricity >= 1.0) return [];

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

  // Sample uniformly in eccentric anomaly E for even geometric distribution.
  // Uniform-in-time sampling clusters points at aphelion for eccentric orbits,
  // leaving the perihelion arc angular/boxy.
  const points: Vec2[] = new Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    const E = (i / numPoints) * TWO_PI;
    const xOrbital = a * (Math.cos(E) - e);
    const yOrbital = b * Math.sin(E);
    points[i] = orbitalToEcliptic(xOrbital, yOrbital, iRad, omegaRad, OmegaRad);
  }
  return points;
}

export function orbitalVelocity(elements: OrbitalElements, r?: number): number {
  const { semiMajorAxis: a, eccentricity: e, period, mu } = elements;

  if (e >= 1.0) {
    // v = sqrt(mu * (2/r + 1/|a|))
    const muVal = mu ?? 1.32712440018e11;
    const absA = Math.abs(a);
    const rVal = r ?? absA * (e - 1);
    return Math.sqrt(muVal * (2 / rVal + 1 / absA));
  }

  const circumference = TWO_PI * a * Math.sqrt(1 - e ** 2);
  const periodSeconds = period * SECONDS_PER_DAY;
  return circumference / periodSeconds;
}
