export interface Vec2 {
  x: number;
  y: number;
}

/** Keplerian orbital elements (J2000 epoch) */
export interface OrbitalElements {
  /** km, negative for hyperbolic orbits */
  semiMajorAxis: number;
  eccentricity: number;
  /** degrees */
  inclination: number;
  /** degrees */
  argPerihelion: number;
  /** degrees */
  longAscNode: number;
  /** degrees, at J2000 epoch */
  meanAnomalyEpoch: number;
  /** Earth days, unused for hyperbolic orbits */
  period: number;
  /** km^3/s^2, required for hyperbolic orbits */
  mu?: number;
}

export type BodyType = "star" | "planet" | "dwarf-planet" | "moon" | "probe" | "comet";

export interface CelestialBodyData {
  id: string;
  name: string;
  type: BodyType;
  /** km */
  radius: number;
  /** kg */
  mass: number;
  color: string;
  orbit?: OrbitalElements;
  parentId?: string;
  details?: BodyDetails;
}

export interface BodyDetails {
  /** Kelvin */
  meanTemperature?: number;
  /** hours, negative = retrograde rotation */
  rotationPeriod?: number;
  /** degrees */
  axialTilt?: number;
  /** total known moons (IAU recognized) */
  knownMoons?: number;
  /** year of discovery, undefined for bodies known since antiquity */
  discoveryYear?: number;
  /** ISO date string for probes */
  launchDate?: string;
  /** current mission status for probes */
  status?: string;
  /** last perihelion date for comets */
  lastPerihelion?: string;
  /** next perihelion date for comets */
  nextPerihelion?: string;
}

export interface BodyState {
  id: string;
  /** km, relative to system center */
  position: Vec2;
  /** radians */
  trueAnomaly: number;
  /** km, true 3D distance from system center */
  distanceFromCenter: number;
  /** km, true 3D orbital radius from parent (not projected) */
  orbitalRadius: number;
  /** km/s */
  velocity: number;
}

export interface CameraState {
  center: Vec2;
  kmPerPixel: number;
}

export interface SimulationState {
  simTime: number;
  speed: number;
  paused: boolean;
}

export interface OrbitPath {
  bodyId: string;
  points: Vec2[];
}

export interface SystemDefinition {
  id: string;
  name: string;
  bodies: CelestialBodyData[];
  centerBodyId: string;
  defaultKmPerPixel: number;
  maxOrbitRadius: number;
}
