import type { CelestialBodyData, SystemDefinition } from "./types";

/** J2000 epoch as Julian Date */
export const J2000_EPOCH = 2451545.0;

/** 1 AU in km */
export const AU_KM = 149_597_870.7;

/** Sun's gravitational parameter in km^3/s^2 */
export const MU_SUN = 1.32712440018e11;

/** Gravitational constant in km^3 / (kg * s^2) */
export const G_KM3 = 6.6743e-20;

/** Current days since J2000 epoch */
export function currentDaysSinceJ2000(): number {
  const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  return (Date.now() - j2000Ms) / 86_400_000;
}

// ===== Heliosphere boundaries =====

/** Termination shock radius in km (average ~90 AU; V1 crossed at 94, V2 at 84) */
export const TERMINATION_SHOCK_AU = 90;
export const TERMINATION_SHOCK_KM = TERMINATION_SHOCK_AU * AU_KM;

/** Heliopause radius in km (average ~120 AU; V1 crossed at 122, V2 at 119) */
export const HELIOPAUSE_AU = 120;
export const HELIOPAUSE_KM = HELIOPAUSE_AU * AU_KM;

/**
 * Direction of the heliosphere nose (apex of Sun's motion through ISM).
 * Ecliptic longitude ~255°, latitude ~5°.
 * The heliosphere is compressed on the nose side and elongated on the tail side.
 */
export const HELIOSPHERE_NOSE_LONGITUDE_DEG = 255;

export function buildBodyMap(bodies: CelestialBodyData[]): ReadonlyMap<string, CelestialBodyData> {
  return new Map(bodies.map((b) => [b.id, b]));
}

export function getChildrenFrom(bodies: CelestialBodyData[], parentId: string): CelestialBodyData[] {
  return bodies.filter((b) => b.parentId === parentId);
}

/**
 * All celestial bodies with real astronomical data.
 * Orbital elements are J2000 epoch values.
 * Sources: NASA JPL, IAU
 */
export const CELESTIAL_BODIES: CelestialBodyData[] = [
  {
    id: "sun",
    name: "Sun",
    type: "star",
    radius: 696_340,
    mass: 1.989e30,
    color: "#FDB813",
  },

  {
    id: "mercury",
    name: "Mercury",
    type: "planet",
    radius: 2_439.7,
    mass: 3.301e23,
    color: "#B5A7A7",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 57_909_050,
      eccentricity: 0.2056,
      inclination: 7.005,
      argPerihelion: 29.124,
      longAscNode: 48.331,
      meanAnomalyEpoch: 174.796,
      period: 87.969,
    },
  },
  {
    id: "venus",
    name: "Venus",
    type: "planet",
    radius: 6_051.8,
    mass: 4.867e24,
    color: "#E6C073",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 108_208_000,
      eccentricity: 0.0068,
      inclination: 3.3947,
      argPerihelion: 54.884,
      longAscNode: 76.68,
      meanAnomalyEpoch: 50.115,
      period: 224.701,
    },
  },
  {
    id: "earth",
    name: "Earth",
    type: "planet",
    radius: 6_371,
    mass: 5.972e24,
    color: "#6B93D6",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 149_598_023,
      eccentricity: 0.0167,
      inclination: 0.00005,
      argPerihelion: 114.208,
      longAscNode: -11.26,
      meanAnomalyEpoch: 358.617,
      period: 365.256,
    },
  },
  {
    id: "mars",
    name: "Mars",
    type: "planet",
    radius: 3_389.5,
    mass: 6.417e23,
    color: "#C1440E",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 227_939_200,
      eccentricity: 0.0934,
      inclination: 1.85,
      argPerihelion: 286.502,
      longAscNode: 49.558,
      meanAnomalyEpoch: 19.373,
      period: 686.971,
    },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    radius: 69_911,
    mass: 1.898e27,
    color: "#C88B3A",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 778_570_000,
      eccentricity: 0.0489,
      inclination: 1.303,
      argPerihelion: 273.867,
      longAscNode: 100.464,
      meanAnomalyEpoch: 20.02,
      period: 4332.59,
    },
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "planet",
    radius: 58_232,
    mass: 5.683e26,
    color: "#E8D191",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 1_433_530_000,
      eccentricity: 0.0565,
      inclination: 2.485,
      argPerihelion: 339.392,
      longAscNode: 113.665,
      meanAnomalyEpoch: 317.02,
      period: 10_759.22,
    },
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "planet",
    radius: 25_362,
    mass: 8.681e25,
    color: "#D1E7E7",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 2_872_460_000,
      eccentricity: 0.0457,
      inclination: 0.773,
      argPerihelion: 96.998,
      longAscNode: 74.006,
      meanAnomalyEpoch: 142.238,
      period: 30_688.5,
    },
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "planet",
    radius: 24_622,
    mass: 1.024e26,
    color: "#5B5DDF",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 4_495_060_000,
      eccentricity: 0.0113,
      inclination: 1.77,
      argPerihelion: 276.336,
      longAscNode: 131.784,
      meanAnomalyEpoch: 256.228,
      period: 60_182.0,
    },
  },
  {
    id: "pluto",
    name: "Pluto",
    type: "dwarf-planet",
    radius: 1_188.3,
    mass: 1.303e22,
    color: "#C9B8A4",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 5_906_380_000,
      eccentricity: 0.2488,
      inclination: 17.16,
      argPerihelion: 113.834,
      longAscNode: 110.299,
      meanAnomalyEpoch: 14.53,
      period: 90_560.0,
    },
  },

  {
    id: "moon",
    name: "Moon",
    type: "moon",
    radius: 1_737.4,
    mass: 7.342e22,
    color: "#C4C4C4",
    parentId: "earth",
    orbit: {
      semiMajorAxis: 384_400,
      eccentricity: 0.0549,
      inclination: 5.145,
      argPerihelion: 318.15,
      longAscNode: 125.08,
      meanAnomalyEpoch: 135.27,
      period: 27.322,
    },
  },

  {
    id: "phobos",
    name: "Phobos",
    type: "moon",
    radius: 11.267,
    mass: 1.0659e16,
    color: "#8C7E6D",
    parentId: "mars",
    orbit: {
      semiMajorAxis: 9_376,
      eccentricity: 0.0151,
      inclination: 1.093,
      argPerihelion: 150.057,
      longAscNode: 164.931,
      meanAnomalyEpoch: 91.059,
      period: 0.3189,
    },
  },
  {
    id: "deimos",
    name: "Deimos",
    type: "moon",
    radius: 6.2,
    mass: 1.4762e15,
    color: "#A89F91",
    parentId: "mars",
    orbit: {
      semiMajorAxis: 23_463,
      eccentricity: 0.0002,
      inclination: 0.93,
      argPerihelion: 290.496,
      longAscNode: 339.6,
      meanAnomalyEpoch: 325.0,
      period: 1.2624,
    },
  },

  {
    id: "io",
    name: "Io",
    type: "moon",
    radius: 1_821.6,
    mass: 8.932e22,
    color: "#E5D55A",
    parentId: "jupiter",
    orbit: {
      semiMajorAxis: 421_700,
      eccentricity: 0.0041,
      inclination: 0.036,
      argPerihelion: 84.129,
      longAscNode: 43.977,
      meanAnomalyEpoch: 342.021,
      period: 1.7691,
    },
  },
  {
    id: "europa",
    name: "Europa",
    type: "moon",
    radius: 1_560.8,
    mass: 4.8e22,
    color: "#A89F91",
    parentId: "jupiter",
    orbit: {
      semiMajorAxis: 671_100,
      eccentricity: 0.0094,
      inclination: 0.466,
      argPerihelion: 88.97,
      longAscNode: 219.106,
      meanAnomalyEpoch: 171.016,
      period: 3.5512,
    },
  },
  {
    id: "ganymede",
    name: "Ganymede",
    type: "moon",
    radius: 2_634.1,
    mass: 1.482e23,
    color: "#8C8278",
    parentId: "jupiter",
    orbit: {
      semiMajorAxis: 1_070_400,
      eccentricity: 0.0013,
      inclination: 0.177,
      argPerihelion: 192.417,
      longAscNode: 63.552,
      meanAnomalyEpoch: 317.54,
      period: 7.1546,
    },
  },
  {
    id: "callisto",
    name: "Callisto",
    type: "moon",
    radius: 2_410.3,
    mass: 1.076e23,
    color: "#6B6050",
    parentId: "jupiter",
    orbit: {
      semiMajorAxis: 1_882_700,
      eccentricity: 0.0074,
      inclination: 0.192,
      argPerihelion: 52.643,
      longAscNode: 298.848,
      meanAnomalyEpoch: 181.408,
      period: 16.689,
    },
  },

  {
    id: "titan",
    name: "Titan",
    type: "moon",
    radius: 2_574.7,
    mass: 1.345e23,
    color: "#D4A857",
    parentId: "saturn",
    orbit: {
      semiMajorAxis: 1_221_870,
      eccentricity: 0.0288,
      inclination: 0.348,
      argPerihelion: 180.532,
      longAscNode: 28.06,
      meanAnomalyEpoch: 120.0,
      period: 15.945,
    },
  },
  {
    id: "enceladus",
    name: "Enceladus",
    type: "moon",
    radius: 252.1,
    mass: 1.08e20,
    color: "#F0F0F0",
    parentId: "saturn",
    orbit: {
      semiMajorAxis: 237_948,
      eccentricity: 0.0047,
      inclination: 0.009,
      argPerihelion: 0.0,
      longAscNode: 0.0,
      meanAnomalyEpoch: 200.0,
      period: 1.3702,
    },
  },
  {
    id: "mimas",
    name: "Mimas",
    type: "moon",
    radius: 198.2,
    mass: 3.749e19,
    color: "#B0A8A0",
    parentId: "saturn",
    orbit: {
      semiMajorAxis: 185_539,
      eccentricity: 0.0196,
      inclination: 1.574,
      argPerihelion: 332.0,
      longAscNode: 173.0,
      meanAnomalyEpoch: 14.0,
      period: 0.9424,
    },
  },

  {
    id: "titania",
    name: "Titania",
    type: "moon",
    radius: 788.4,
    mass: 3.527e21,
    color: "#C0B8A8",
    parentId: "uranus",
    orbit: {
      semiMajorAxis: 435_910,
      eccentricity: 0.0011,
      inclination: 0.34,
      argPerihelion: 284.4,
      longAscNode: 167.1,
      meanAnomalyEpoch: 24.614,
      period: 8.7059,
    },
  },
  {
    id: "oberon",
    name: "Oberon",
    type: "moon",
    radius: 761.4,
    mass: 3.014e21,
    color: "#A09888",
    parentId: "uranus",
    orbit: {
      semiMajorAxis: 583_520,
      eccentricity: 0.0014,
      inclination: 0.058,
      argPerihelion: 104.4,
      longAscNode: 279.8,
      meanAnomalyEpoch: 283.088,
      period: 13.4632,
    },
  },
  {
    id: "miranda",
    name: "Miranda",
    type: "moon",
    radius: 235.8,
    mass: 6.59e19,
    color: "#989088",
    parentId: "uranus",
    orbit: {
      semiMajorAxis: 129_390,
      eccentricity: 0.0013,
      inclination: 4.232,
      argPerihelion: 68.312,
      longAscNode: 326.438,
      meanAnomalyEpoch: 311.33,
      period: 1.4135,
    },
  },

  {
    id: "triton",
    name: "Triton",
    type: "moon",
    radius: 1_353.4,
    mass: 2.14e22,
    color: "#B0C4DE",
    parentId: "neptune",
    orbit: {
      semiMajorAxis: 354_759,
      eccentricity: 0.000016,
      inclination: 156.885,
      argPerihelion: 344.046,
      longAscNode: 177.608,
      meanAnomalyEpoch: 264.775,
      period: 5.877,
    },
  },

  {
    id: "charon",
    name: "Charon",
    type: "moon",
    radius: 606,
    mass: 1.586e21,
    color: "#8B8682",
    parentId: "pluto",
    orbit: {
      semiMajorAxis: 19_591,
      eccentricity: 0.0002,
      inclination: 0.08,
      argPerihelion: 71.255,
      longAscNode: 85.187,
      meanAnomalyEpoch: 147.848,
      period: 6.3872,
    },
  },
];

/**
 * Space probes on hyperbolic escape trajectories.
 * Heliocentric osculating elements at J2000 epoch (2000-Jan-01 12:00 TDB).
 * Source: NASA JPL Horizons System (https://ssd.jpl.nasa.gov/horizons/)
 * Query: TABLE_TYPE='ELEMENTS', CENTER='@0', OUT_UNITS='KM-S', REF_PLANE='ECLIPTIC', REF_SYSTEM='J2000'
 *
 * For New Horizons: elements from 2010-Jan-01 epoch, mean anomaly back-propagated
 * to J2000 using n = sqrt(mu/|a|^3). NH launched 2006; positions before ~2007 are
 * mathematical extrapolations of its post-Jupiter-flyby trajectory.
 */
export const SPACE_PROBES: CelestialBodyData[] = [
  {
    id: "voyager-1",
    name: "Voyager 1",
    type: "probe",
    radius: 0.001,
    mass: 825,
    color: "#00E88C",
    parentId: "sun",
    orbit: {
      semiMajorAxis: -4.819957852225282e8,
      eccentricity: 3.723122267763835,
      inclination: 35.77393839688077,
      argPerihelion: 338.2818767759758,
      longAscNode: 178.9773609196685,
      meanAnomalyEpoch: 1247.843951044291,
      period: 0,
      mu: MU_SUN,
    },
  },
  {
    id: "voyager-2",
    name: "Voyager 2",
    type: "probe",
    radius: 0.001,
    mass: 815,
    color: "#00C8FF",
    parentId: "sun",
    orbit: {
      semiMajorAxis: -6.022719484422929e8,
      eccentricity: 6.275815946308339,
      inclination: 7.877031046396922,
      argPerihelion: 130.0579635047376,
      longAscNode: 101.6319500601298,
      meanAnomalyEpoch: 743.5347902802679,
      period: 0,
      mu: MU_SUN,
    },
  },
  {
    id: "pioneer-10",
    name: "Pioneer 10",
    type: "probe",
    radius: 0.001,
    mass: 258,
    color: "#88DD44",
    parentId: "sun",
    orbit: {
      semiMajorAxis: -1.037935409897059e9,
      eccentricity: 1.729254978734509,
      inclination: 3.143172603953164,
      argPerihelion: 346.7325129001001,
      longAscNode: 331.9964063828834,
      meanAnomalyEpoch: 514.1517200074045,
      period: 0,
      mu: MU_SUN,
    },
  },
  {
    id: "pioneer-11",
    name: "Pioneer 11",
    type: "probe",
    radius: 0.001,
    mass: 259,
    color: "#AADD66",
    parentId: "sun",
    orbit: {
      semiMajorAxis: -1.218350796368277e9,
      eccentricity: 2.147457728703155,
      inclination: 16.62887423935044,
      argPerihelion: 12.79043658997367,
      longAscNode: 160.3301127292202,
      meanAnomalyEpoch: 311.3510674255978,
      period: 0,
      mu: MU_SUN,
    },
  },
  {
    // Elements from 2010-Jan-01 (JD 2455197.5), M0 back-propagated to J2000.
    // n = sqrt(mu/|a|^3) = 1.4774e-8 rad/s = 0.07314 deg/day
    // offset = -3652.5 days; M0_J2000 = 104.274 + 0.07314 * (-3652.5) = -162.83
    id: "new-horizons",
    name: "New Horizons",
    type: "probe",
    radius: 0.001,
    mass: 478,
    color: "#44DDCC",
    parentId: "sun",
    orbit: {
      semiMajorAxis: -8.472339707373476e8,
      eccentricity: 1.399406897361078,
      inclination: 2.346105746297433,
      argPerihelion: 287.934282554825,
      longAscNode: 229.5411986098987,
      meanAnomalyEpoch: -162.83,
      period: 0,
      mu: MU_SUN,
    },
  },
];

export const BODY_MAP: ReadonlyMap<string, CelestialBodyData> = buildBodyMap(CELESTIAL_BODIES);

export function getChildren(parentId: string): CelestialBodyData[] {
  return getChildrenFrom(CELESTIAL_BODIES, parentId);
}

export function getPlanets(): CelestialBodyData[] {
  return CELESTIAL_BODIES.filter((b) => b.type === "planet" || b.type === "dwarf-planet");
}

export const SHORTCUT_BODIES = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export const SOLAR_SYSTEM: SystemDefinition = {
  id: "solar-system",
  name: "Solar System",
  bodies: CELESTIAL_BODIES,
  centerBodyId: "sun",
  defaultKmPerPixel: 500_000,
  maxOrbitRadius: HELIOPAUSE_KM * 1.5,
};
