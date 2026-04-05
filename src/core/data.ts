import type { CelestialBodyData, SystemDefinition } from "./types";

/** J2000 epoch as Julian Date */
export const J2000_EPOCH = 2451545.0;

/** 1 AU in km */
export const AU_KM = 149_597_870.7;

/** Sun's gravitational parameter in km^3/s^2 */
export const MU_SUN = 1.32712440018e11;

/** Gravitational constant in km^3 / (kg * s^2) */
export const G_KM3 = 6.6743e-20;

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

// Ecliptic longitude of heliosphere nose (~255°, compressed side)
export const HELIOSPHERE_NOSE_LONGITUDE_DEG = 255;

// ===== Oort Cloud =====

/** Inner edge of the Oort Cloud (~2,000 AU) */
export const OORT_CLOUD_INNER_AU = 2_000;
export const OORT_CLOUD_INNER_KM = OORT_CLOUD_INNER_AU * AU_KM;

/** Outer edge of the Oort Cloud (~100,000 AU, ~1.58 light-years) */
export const OORT_CLOUD_OUTER_AU = 100_000;
export const OORT_CLOUD_OUTER_KM = OORT_CLOUD_OUTER_AU * AU_KM;

// ===== Asteroid Belt =====

/** Inner edge of the main asteroid belt (~2.06 AU) */
export const ASTEROID_BELT_INNER_AU = 2.06;
export const ASTEROID_BELT_INNER_KM = ASTEROID_BELT_INNER_AU * AU_KM;

/** Outer edge of the main asteroid belt (~3.27 AU) */
export const ASTEROID_BELT_OUTER_AU = 3.27;
export const ASTEROID_BELT_OUTER_KM = ASTEROID_BELT_OUTER_AU * AU_KM;

// ===== Kuiper Belt =====

/** Inner edge of the Kuiper Belt (~30 AU, roughly Neptune's orbit) */
export const KUIPER_BELT_INNER_AU = 30;
export const KUIPER_BELT_INNER_KM = KUIPER_BELT_INNER_AU * AU_KM;

/** Outer edge of the Kuiper Belt (~50 AU) */
export const KUIPER_BELT_OUTER_AU = 50;
export const KUIPER_BELT_OUTER_KM = KUIPER_BELT_OUTER_AU * AU_KM;

export const JUPITER_RING_INNER_KM = 122_500;
export const JUPITER_RING_OUTER_KM = 229_000;
export const JUPITER_RADIUS_KM = 69_911;

export const SATURN_RING_INNER_KM = 66_900;
export const SATURN_RING_OUTER_KM = 140_180;
export const SATURN_RADIUS_KM = 58_232;

export function buildBodyMap(bodies: CelestialBodyData[]): ReadonlyMap<string, CelestialBodyData> {
  return new Map(bodies.map((b) => [b.id, b]));
}

export function getChildrenFrom(bodies: CelestialBodyData[], parentId: string): CelestialBodyData[] {
  return bodies.filter((b) => b.parentId === parentId);
}

// Orbital elements: J2000 epoch. Sources: NASA JPL, IAU
export const CELESTIAL_BODIES: CelestialBodyData[] = [
  {
    id: "sun",
    name: "Sun",
    type: "star",
    radius: 696_340,
    mass: 1.989e30,
    color: "#FDB813",
    details: {
      meanTemperature: 5_778,
      rotationPeriod: 609.12, // ~25.38 days at equator
      axialTilt: 7.25,
    },
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
    details: {
      meanTemperature: 440,
      rotationPeriod: 1407.6,
      axialTilt: 0.034,
      knownMoons: 0,
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
    details: {
      meanTemperature: 737,
      rotationPeriod: -5832.5, // retrograde
      axialTilt: 177.36,
      knownMoons: 0,
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
    details: {
      meanTemperature: 288,
      rotationPeriod: 23.934,
      axialTilt: 23.44,
      knownMoons: 1,
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
    details: {
      meanTemperature: 210,
      rotationPeriod: 24.623,
      axialTilt: 25.19,
      knownMoons: 2,
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
    details: {
      meanTemperature: 165,
      rotationPeriod: 9.925,
      axialTilt: 3.13,
      knownMoons: 95,
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
    details: {
      meanTemperature: 134,
      rotationPeriod: 10.656,
      axialTilt: 26.73,
      knownMoons: 146,
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
    details: {
      meanTemperature: 76,
      rotationPeriod: -17.24, // retrograde
      axialTilt: 97.77,
      knownMoons: 28,
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
    details: {
      meanTemperature: 72,
      rotationPeriod: 16.11,
      axialTilt: 28.32,
      knownMoons: 16,
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
    details: {
      meanTemperature: 44,
      rotationPeriod: -153.293, // retrograde
      axialTilt: 122.53,
      knownMoons: 5,
      discoveryYear: 1930,
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
    details: {
      meanTemperature: 220,
      rotationPeriod: 655.73, // tidally locked
      axialTilt: 6.68,
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
    details: {
      meanTemperature: 233,
      rotationPeriod: 7.654, // tidally locked
      discoveryYear: 1877,
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
    details: {
      meanTemperature: 233,
      rotationPeriod: 30.3, // tidally locked
      discoveryYear: 1877,
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
    details: {
      meanTemperature: 110,
      rotationPeriod: 42.459, // tidally locked
      discoveryYear: 1610,
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
    details: {
      meanTemperature: 102,
      rotationPeriod: 85.228, // tidally locked
      discoveryYear: 1610,
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
    details: {
      meanTemperature: 110,
      rotationPeriod: 171.71, // tidally locked
      discoveryYear: 1610,
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
    details: {
      meanTemperature: 134,
      rotationPeriod: 400.54, // tidally locked
      discoveryYear: 1610,
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
    details: {
      meanTemperature: 94,
      rotationPeriod: 382.68, // tidally locked
      discoveryYear: 1655,
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
    details: {
      meanTemperature: 75,
      rotationPeriod: 32.885, // tidally locked
      discoveryYear: 1789,
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
    details: {
      meanTemperature: 64,
      rotationPeriod: 22.618, // tidally locked
      discoveryYear: 1789,
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
    details: {
      meanTemperature: 70,
      rotationPeriod: 208.94, // tidally locked
      discoveryYear: 1787,
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
    details: {
      meanTemperature: 75,
      rotationPeriod: 323.12, // tidally locked
      discoveryYear: 1787,
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
    details: {
      meanTemperature: 59,
      rotationPeriod: 33.924, // tidally locked
      discoveryYear: 1948,
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
    details: {
      meanTemperature: 38,
      rotationPeriod: -141.048, // retrograde, tidally locked
      discoveryYear: 1846,
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
    details: {
      meanTemperature: 53,
      rotationPeriod: 153.294, // tidally locked (mutually with Pluto)
      discoveryYear: 1978,
    },
  },
];

export const EXTRA_DWARF_PLANETS: CelestialBodyData[] = [
  {
    id: "ceres",
    name: "Ceres",
    type: "dwarf-planet",
    radius: 473,
    mass: 9.393e20,
    color: "#8C8A85",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 413_690_000,
      eccentricity: 0.0758,
      inclination: 10.594,
      argPerihelion: 73.597,
      longAscNode: 80.329,
      meanAnomalyEpoch: 77.372,
      period: 1_681.63,
    },
    details: {
      meanTemperature: 168,
      rotationPeriod: 9.074,
      axialTilt: 4.0,
      knownMoons: 0,
      discoveryYear: 1801,
    },
  },
  {
    id: "eris",
    name: "Eris",
    type: "dwarf-planet",
    radius: 1_163,
    mass: 1.66e22,
    color: "#D4CFC7",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 10_125_000_000,
      eccentricity: 0.4407,
      inclination: 44.04,
      argPerihelion: 151.639,
      longAscNode: 35.877,
      meanAnomalyEpoch: 205.989,
      period: 204_199.0,
    },
    details: {
      meanTemperature: 42,
      rotationPeriod: 25.9,
      axialTilt: 78.0,
      knownMoons: 1,
      discoveryYear: 2005,
    },
  },
  {
    id: "haumea",
    name: "Haumea",
    type: "dwarf-planet",
    radius: 816,
    mass: 4.006e21,
    color: "#E8E0D0",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 6_452_000_000,
      eccentricity: 0.1912,
      inclination: 28.19,
      argPerihelion: 239.041,
      longAscNode: 122.167,
      meanAnomalyEpoch: 218.205,
      period: 103_774.0,
    },
    details: {
      meanTemperature: 32,
      rotationPeriod: 3.915,
      axialTilt: 126.0,
      knownMoons: 2,
      discoveryYear: 2004,
    },
  },
  {
    id: "makemake",
    name: "Makemake",
    type: "dwarf-planet",
    radius: 715,
    mass: 3.1e21,
    color: "#D2B48C",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 6_796_000_000,
      eccentricity: 0.1559,
      inclination: 28.98,
      argPerihelion: 297.152,
      longAscNode: 79.382,
      meanAnomalyEpoch: 165.514,
      period: 112_897.0,
    },
    details: {
      meanTemperature: 40,
      rotationPeriod: 22.827,
      knownMoons: 1,
      discoveryYear: 2005,
    },
  },
  {
    id: "sedna",
    name: "Sedna",
    type: "dwarf-planet",
    radius: 495,
    mass: 8.3e20,
    color: "#B07060",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 82_255_000_000,
      eccentricity: 0.861,
      inclination: 11.9252,
      argPerihelion: 310.733,
      longAscNode: 144.317,
      meanAnomalyEpoch: 357.901,
      period: 4_709_313.0,
    },
    details: {
      meanTemperature: 12,
      rotationPeriod: 10.273,
      knownMoons: 0,
      discoveryYear: 2003,
    },
  },
  {
    id: "2012-vp113",
    name: "2012 VP₁₁₃",
    type: "dwarf-planet",
    radius: 255,
    mass: 1.0e20,
    color: "#C4A898",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 41_186_000_000,
      eccentricity: 0.7075,
      inclination: 24.0216,
      argPerihelion: 293.988,
      longAscNode: 90.893,
      meanAnomalyEpoch: 1.62,
      period: 1_668_461.0,
    },
    details: {
      meanTemperature: 15,
      knownMoons: 0,
      discoveryYear: 2012,
    },
  },
  {
    id: "dysnomia",
    name: "Dysnomia",
    type: "moon",
    radius: 350,
    mass: 8.2e19,
    color: "#9E9690",
    parentId: "eris",
    orbit: {
      semiMajorAxis: 37_273,
      eccentricity: 0.0062,
      inclination: 61.3,
      argPerihelion: 126.17,
      longAscNode: 139.5,
      meanAnomalyEpoch: 178.0,
      period: 15.774,
    },
    details: {
      meanTemperature: 30,
      discoveryYear: 2005,
    },
  },
  {
    id: "hiiaka",
    name: "Hi'iaka",
    type: "moon",
    radius: 160,
    mass: 1.79e19,
    color: "#C8C0B8",
    parentId: "haumea",
    orbit: {
      semiMajorAxis: 49_880,
      eccentricity: 0.0513,
      inclination: 126.356,
      argPerihelion: 278.6,
      longAscNode: 206.766,
      meanAnomalyEpoch: 150.0,
      period: 49.462,
    },
    details: {
      discoveryYear: 2005,
    },
  },
  {
    id: "namaka",
    name: "Namaka",
    type: "moon",
    radius: 85,
    mass: 1.79e18,
    color: "#B8B0A8",
    parentId: "haumea",
    orbit: {
      semiMajorAxis: 25_657,
      eccentricity: 0.249,
      inclination: 113.013,
      argPerihelion: 178.9,
      longAscNode: 205.016,
      meanAnomalyEpoch: 90.0,
      period: 18.278,
    },
    details: {
      discoveryYear: 2005,
    },
  },
];

// Heliocentric osculating elements at J2000 (NASA JPL Horizons)
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
    details: {
      launchDate: "1977-09-05",
      status: "Active, in interstellar space",
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
    details: {
      launchDate: "1977-08-20",
      status: "Active, in interstellar space",
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
    details: {
      launchDate: "1972-03-03",
      status: "Signal lost (last contact 2003)",
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
    details: {
      launchDate: "1973-04-06",
      status: "Signal lost (last contact 1995)",
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
    details: {
      launchDate: "2006-01-19",
      status: "Active, in Kuiper Belt",
    },
  },
];

// Heliocentric osculating elements at J2000 (JPL Horizons / MPC)
export const COMETS: CelestialBodyData[] = [
  {
    // 1P/Halley — last perihelion 1986-02-09, next ~2061-07-28
    // JPL solution: epoch 1994-02-17 (JD 2449401.5), back-propagated to J2000
    // a = 17.83414 AU, M at epoch = 38.384°
    // offset to J2000 = 2451545.0 - 2449401.5 = 2143.5 days
    // n = 360 / 27509.5 = 0.013086 deg/day
    // M0_J2000 = 38.384 + 0.013086 * 2143.5 = 66.43°
    id: "halley",
    name: "1P/Halley",
    type: "comet",
    radius: 5.5,
    mass: 2.2e14,
    color: "#88CCFF",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 2_667_950_710,
      eccentricity: 0.96714,
      inclination: 162.2627,
      argPerihelion: 111.3325,
      longAscNode: 58.42,
      meanAnomalyEpoch: 66.43,
      period: 27509.5,
    },
    details: {
      discoveryYear: -239,
      lastPerihelion: "1986-02-09",
      nextPerihelion: "~2061-07-28",
    },
  },
  {
    // 2P/Encke — short period comet, a = 2.21526 AU
    // JPL epoch 2000-10-16 (JD 2451833.5)
    // M at epoch = 228.16°, offset = 2451545.0 - 2451833.5 = -288.5 days
    // n = 360 / 1204.3 = 0.29893 deg/day
    // M0_J2000 = 228.16 + 0.29893 * (-288.5) = 141.89°
    id: "encke",
    name: "2P/Encke",
    type: "comet",
    radius: 2.4,
    mass: 7.0e13,
    color: "#FFD080",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 331_375_360,
      eccentricity: 0.8483,
      inclination: 11.782,
      argPerihelion: 186.546,
      longAscNode: 334.572,
      meanAnomalyEpoch: 141.89,
      period: 1204.3,
    },
    details: {
      discoveryYear: 1786,
      lastPerihelion: "2023-10-22",
      nextPerihelion: "~2027-02-11",
    },
  },
  {
    // 67P/Churyumov-Gerasimenko — Rosetta target, a = 3.4630 AU
    // JPL epoch 2002-08-06 (JD 2452493.0)
    // M at epoch = 121.35°, offset = 2451545.0 - 2452493.0 = -948.0 days
    // n = 360 / 2354.0 = 0.15293 deg/day
    // M0_J2000 = 121.35 + 0.15293 * (-948.0) = -23.64° → 336.36°
    id: "67p",
    name: "67P/Churyumov-Gerasimenko",
    type: "comet",
    radius: 2.0,
    mass: 9.982e12,
    color: "#AA9977",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 518_050_800,
      eccentricity: 0.64102,
      inclination: 7.0402,
      argPerihelion: 12.78,
      longAscNode: 50.147,
      meanAnomalyEpoch: 336.36,
      period: 2354.0,
    },
    details: {
      discoveryYear: 1969,
      lastPerihelion: "2021-11-02",
      nextPerihelion: "~2028-04-12",
    },
  },
  {
    // 46P/Wirtanen — short period, a = 3.0924 AU
    // JPL epoch 2018-12-12 (JD 2458465.5)
    // M at epoch = 359.23°, offset = 2451545.0 - 2458465.5 = -6920.5 days
    // n = 360 / 1985.9 = 0.18127 deg/day
    // M0_J2000 = 359.23 + 0.18127 * (-6920.5) = -894.8° mod 360 = 185.2°
    id: "wirtanen",
    name: "46P/Wirtanen",
    type: "comet",
    radius: 0.6,
    mass: 2.0e13,
    color: "#66CCAA",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 462_590_200,
      eccentricity: 0.65898,
      inclination: 11.747,
      argPerihelion: 356.341,
      longAscNode: 82.162,
      meanAnomalyEpoch: 185.2,
      period: 1985.9,
    },
    details: {
      discoveryYear: 1948,
      lastPerihelion: "2018-12-12",
      nextPerihelion: "~2024-06-01",
    },
  },
  {
    // C/1995 O1 (Hale-Bopp) — Great Comet of 1997, a = 186.0 AU
    // JPL epoch 1997-04-01 (JD 2450539.5), perihelion 1997-04-01
    // M at epoch ≈ 0° (at perihelion), offset = 2451545.0 - 2450539.5 = 1005.5 days
    // n = 360 / 920670 = 0.000391 deg/day
    // M0_J2000 = 0 + 0.000391 * 1005.5 = 0.393°
    id: "hale-bopp",
    name: "C/1995 O1 (Hale-Bopp)",
    type: "comet",
    radius: 30,
    mass: 1.0e16,
    color: "#DDDDFF",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 27_824_322_000,
      eccentricity: 0.99508,
      inclination: 89.43,
      argPerihelion: 130.591,
      longAscNode: 282.471,
      meanAnomalyEpoch: 0.393,
      period: 920670.0,
    },
    details: {
      discoveryYear: 1995,
      lastPerihelion: "1997-04-01",
      nextPerihelion: "~4530",
    },
  },
  {
    // 109P/Swift-Tuttle — source of Perseids, a = 26.092 AU
    // JPL epoch 1992-12-12 (JD 2448968.5), perihelion 1992-12-12
    // M at epoch ≈ 0°, offset = 2451545.0 - 2448968.5 = 2576.5 days
    // n = 360 / 48691 = 0.007393 deg/day
    // M0_J2000 = 0 + 0.007393 * 2576.5 = 19.04°
    id: "swift-tuttle",
    name: "109P/Swift-Tuttle",
    type: "comet",
    radius: 13,
    mass: 5.0e15,
    color: "#CC88FF",
    parentId: "sun",
    orbit: {
      semiMajorAxis: 3_903_490_000,
      eccentricity: 0.96323,
      inclination: 113.454,
      argPerihelion: 152.982,
      longAscNode: 139.381,
      meanAnomalyEpoch: 19.04,
      period: 48691.0,
    },
    details: {
      discoveryYear: 1862,
      lastPerihelion: "1992-12-12",
      nextPerihelion: "~2126-07-12",
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
