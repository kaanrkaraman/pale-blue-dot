import { create } from "zustand";
import {
  buildBodyMap,
  COMETS,
  currentDaysSinceJ2000,
  EXTRA_DWARF_PLANETS,
  getChildrenFrom,
  SOLAR_SYSTEM,
  SPACE_PROBES,
} from "../core/data";
import { computeAllPositions } from "../core/simulation";
import type { BodyState, CameraState, CelestialBodyData, OrbitPath, SystemDefinition } from "../core/types";
import type { ViewMode } from "../core/types3d";
import { clampZoom, DEEP_ZOOM_THRESHOLD, getAutoZoomLevel } from "../rendering/camera";
import { clearTrailCache, precomputeAllOrbits } from "../rendering/orbit";

interface SimStore {
  // System
  system: SystemDefinition;

  // Simulation time
  simTime: number;
  speed: number;
  paused: boolean;

  // Camera
  camera: CameraState;
  selectedBodyId: string;

  // View mode
  viewMode: ViewMode;

  // Settings
  humanEyeScale: boolean;
  immersiveBackground: boolean;
  showProbes: boolean;
  showDwarfPlanets: boolean;
  showHeliosphere: boolean;
  showAsteroidBelt: boolean;
  showKuiperBelt: boolean;
  showOortCloud: boolean;
  showProbeModels: boolean;
  showSelectionIndicator: boolean;
  showEclipticPlane: boolean;
  showFullOrbits: boolean;
  showComets: boolean;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;

  // Derived
  activeBodies: CelestialBodyData[];
  bodyMap: ReadonlyMap<string, CelestialBodyData>;
  bodyStates: Map<string, BodyState>;
  orbitPaths: Map<string, OrbitPath>;

  // Actions
  togglePause: () => void;
  speedUp: () => void;
  slowDown: () => void;
  selectBody: (id: string) => void;
  applyZoomDelta: (delta: number) => void;
  toggleViewMode: () => void;
  toggleHumanEyeScale: () => void;
  toggleImmersiveBackground: () => void;
  toggleShowProbes: () => void;
  toggleShowDwarfPlanets: () => void;
  toggleShowHeliosphere: () => void;
  toggleAsteroidBelt: () => void;
  toggleKuiperBelt: () => void;
  toggleOortCloud: () => void;
  toggleProbeModels: () => void;
  toggleSelectionIndicator: () => void;
  toggleEclipticPlane: () => void;
  toggleFullOrbits: () => void;
  toggleShowComets: () => void;
  setSpeed: (speed: number) => void;
  resetToNow: () => void;
  stepTime: (days: number) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  tick: (dtReal: number) => void;
  init: (system?: SystemDefinition) => void;
}

export const SPEED_STEPS = [
  0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30, 60, 182.625, 365.25, 730.5, 3652.5, 18262.5, 36525,
];

function findClosestSpeedIndex(speed: number): number {
  let closest = 0;
  let minDiff = Math.abs(speed - SPEED_STEPS[0]);
  for (let i = 1; i < SPEED_STEPS.length; i++) {
    const diff = Math.abs(speed - SPEED_STEPS[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}

const ZOOM_FACTOR = 1.1;

function computeActiveBodies(system: SystemDefinition): CelestialBodyData[] {
  return [...system.bodies, ...EXTRA_DWARF_PLANETS, ...SPACE_PROBES, ...COMETS];
}

export const useSimStore = create<SimStore>((set, get) => ({
  system: SOLAR_SYSTEM,

  simTime: currentDaysSinceJ2000(),
  speed: 1,
  paused: false,

  camera: {
    center: { x: 0, y: 0 },
    kmPerPixel: SOLAR_SYSTEM.defaultKmPerPixel,
  },
  selectedBodyId: SOLAR_SYSTEM.centerBodyId,

  viewMode: "3d",

  humanEyeScale: false,
  immersiveBackground: true,
  showProbes: true,
  showDwarfPlanets: false,
  showHeliosphere: true,
  showAsteroidBelt: true,
  showKuiperBelt: true,
  showOortCloud: true,
  showProbeModels: false,
  showSelectionIndicator: false,
  showEclipticPlane: true,
  showFullOrbits: false,
  showComets: false,
  leftPanelOpen: true,
  rightPanelOpen: true,

  activeBodies: computeActiveBodies(SOLAR_SYSTEM),
  bodyMap: buildBodyMap(computeActiveBodies(SOLAR_SYSTEM)),
  bodyStates: new Map(),
  orbitPaths: new Map(),

  togglePause: () => set((s) => ({ paused: !s.paused })),

  speedUp: () => {
    const idx = findClosestSpeedIndex(get().speed);
    if (idx < SPEED_STEPS.length - 1) set({ speed: SPEED_STEPS[idx + 1] });
  },

  slowDown: () => {
    const idx = findClosestSpeedIndex(get().speed);
    if (idx > 0) set({ speed: SPEED_STEPS[idx - 1] });
  },

  selectBody: (id: string) => {
    const { activeBodies } = get();
    const bMap = buildBodyMap(activeBodies);
    const body = bMap.get(id);
    if (!body) return;

    const { bodyStates } = get();
    const state = bodyStates.get(id);
    const position = state?.position ?? { x: 0, y: 0 };

    const moons = getChildrenFrom(activeBodies, id);
    const hasMoons = moons.length > 0;
    const maxMoonSMA = hasMoons ? Math.max(...moons.map((m) => m.orbit?.semiMajorAxis ?? 0)) : undefined;

    const kmPerPixel = getAutoZoomLevel(body.type, hasMoons, maxMoonSMA, body.orbit?.semiMajorAxis);

    set({
      selectedBodyId: id,
      camera: { center: { ...position }, kmPerPixel: clampZoom(kmPerPixel) },
    });
  },

  applyZoomDelta: (delta: number) => {
    const { camera, selectedBodyId, system, bodyStates } = get();
    const factor = delta > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    const newZoom = clampZoom(camera.kmPerPixel * factor);

    if (
      newZoom > DEEP_ZOOM_THRESHOLD &&
      camera.kmPerPixel <= DEEP_ZOOM_THRESHOLD &&
      selectedBodyId !== system.centerBodyId
    ) {
      const sunState = bodyStates.get(system.centerBodyId);
      const center = sunState ? { ...sunState.position } : { x: 0, y: 0 };
      set({
        selectedBodyId: system.centerBodyId,
        camera: { center, kmPerPixel: newZoom },
      });
      return;
    }

    set((s) => ({
      camera: { ...s.camera, kmPerPixel: newZoom },
    }));
  },

  toggleViewMode: () => set((s) => ({ viewMode: s.viewMode === "2d" ? "3d" : "2d" })),
  toggleHumanEyeScale: () => set((s) => ({ humanEyeScale: !s.humanEyeScale })),
  toggleImmersiveBackground: () => set((s) => ({ immersiveBackground: !s.immersiveBackground })),
  toggleShowHeliosphere: () => set((s) => ({ showHeliosphere: !s.showHeliosphere })),
  toggleAsteroidBelt: () => set((s) => ({ showAsteroidBelt: !s.showAsteroidBelt })),
  toggleKuiperBelt: () => set((s) => ({ showKuiperBelt: !s.showKuiperBelt })),
  toggleOortCloud: () => set((s) => ({ showOortCloud: !s.showOortCloud })),
  toggleProbeModels: () => set((s) => ({ showProbeModels: !s.showProbeModels })),
  toggleSelectionIndicator: () => set((s) => ({ showSelectionIndicator: !s.showSelectionIndicator })),
  toggleEclipticPlane: () => set((s) => ({ showEclipticPlane: !s.showEclipticPlane })),
  toggleFullOrbits: () => set((s) => ({ showFullOrbits: !s.showFullOrbits })),

  toggleShowProbes: () => set((s) => ({ showProbes: !s.showProbes })),
  toggleShowDwarfPlanets: () => set((s) => ({ showDwarfPlanets: !s.showDwarfPlanets })),
  toggleShowComets: () => set((s) => ({ showComets: !s.showComets })),

  setSpeed: (speed: number) => set({ speed }),

  resetToNow: () => {
    const { activeBodies, system, selectedBodyId } = get();
    const now = currentDaysSinceJ2000();
    const bodyStates = computeAllPositions(now, activeBodies, system.centerBodyId);
    const selected = bodyStates.get(selectedBodyId);
    const center = selected ? { ...selected.position } : { x: 0, y: 0 };
    set((s) => ({
      simTime: now,
      bodyStates,
      camera: { ...s.camera, center },
    }));
  },

  stepTime: (days: number) => {
    const { simTime, activeBodies, system, selectedBodyId } = get();
    const newTime = simTime + days;
    const bodyStates = computeAllPositions(newTime, activeBodies, system.centerBodyId);
    const selected = bodyStates.get(selectedBodyId);
    const center = selected ? { ...selected.position } : get().camera.center;
    set((s) => ({
      simTime: newTime,
      bodyStates,
      camera: { ...s.camera, center },
    }));
  },

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

  tick: (dtReal: number) => {
    const { simTime, speed, paused, selectedBodyId, activeBodies, system } = get();
    if (paused) {
      const selected = get().bodyStates.get(selectedBodyId);
      if (selected) {
        set((s) => ({ camera: { ...s.camera, center: { ...selected.position } } }));
      }
      return;
    }

    const dt = dtReal * speed;
    const newTime = simTime + dt;
    const newStates = computeAllPositions(newTime, activeBodies, system.centerBodyId);

    const selected = newStates.get(selectedBodyId);
    const center = selected ? { ...selected.position } : get().camera.center;

    set((s) => ({
      simTime: newTime,
      bodyStates: newStates,
      camera: { ...s.camera, center },
    }));
  },

  init: (system?: SystemDefinition) => {
    const sys = system ?? SOLAR_SYSTEM;
    const bodies = computeActiveBodies(sys);
    const bMap = buildBodyMap(bodies);
    const orbitPaths = precomputeAllOrbits(bodies);
    const startTime = currentDaysSinceJ2000();
    const bodyStates = computeAllPositions(startTime, bodies, sys.centerBodyId);
    set({
      system: sys,
      activeBodies: bodies,
      bodyMap: bMap,
      orbitPaths,
      bodyStates,
      simTime: startTime,
      selectedBodyId: sys.centerBodyId,
      camera: { center: { x: 0, y: 0 }, kmPerPixel: sys.defaultKmPerPixel },
    });
  },
}));
