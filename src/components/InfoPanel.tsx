import { useEffect, useRef, useState } from "react";
import { AU_KM, G_KM3, getChildrenFrom, MU_SUN } from "../core/data";
import { getBodyDescription } from "../core/descriptions";
import type { BodyState, CelestialBodyData } from "../core/types";
import { useSimStore } from "../store";
import { formatDegrees, formatDistance, formatMass, formatPeriod } from "../utils/format";

interface InfoSnapshot {
  selectedBodyId: string;
  body: CelestialBodyData | undefined;
  bodyState: BodyState | undefined;
  parentBody: CelestialBodyData | undefined;
  parentDistance: number | null;
  sunDistance: number | null;
  childDistances: { name: string; distance: number }[];
  centerBodyId: string;
}

function selectInfo(s: ReturnType<typeof useSimStore.getState>): InfoSnapshot {
  const body = s.bodyMap.get(s.selectedBodyId);
  const bodyState = s.bodyStates.get(s.selectedBodyId);
  const childDistances: { name: string; distance: number }[] = [];
  let parentBody: CelestialBodyData | undefined;
  let parentDistance: number | null = null;
  let sunDistance: number | null = null;

  if (body) {
    const children = getChildrenFrom(s.activeBodies, s.selectedBodyId);
    for (const child of children) {
      const childState = s.bodyStates.get(child.id);
      if (childState) {
        childDistances.push({ name: child.name, distance: childState.orbitalRadius });
      }
    }

    if (bodyState) {
      sunDistance = bodyState.distanceFromCenter;

      if (body.parentId) {
        parentBody = s.bodyMap.get(body.parentId);
        parentDistance = bodyState.orbitalRadius;
      }
    }
  }

  return {
    selectedBodyId: s.selectedBodyId,
    body,
    bodyState,
    parentBody,
    parentDistance,
    sunDistance,
    childDistances,
    centerBodyId: s.system.centerBodyId,
  };
}

function useInfoStore(): InfoSnapshot {
  const [info, setInfo] = useState(() => selectInfo(useSimStore.getState()));
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const selectedBodyId = useSimStore((s) => s.selectedBodyId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedBodyId triggers immediate refresh on selection change
  useEffect(() => {
    setInfo(selectInfo(useSimStore.getState()));
  }, [selectedBodyId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setInfo(selectInfo(useSimStore.getState()));
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, []);

  return info;
}

function getTypeLabel(body: CelestialBodyData): string {
  if (body.type === "star") return "G-type Main-Sequence Star";
  if (body.type === "probe") return "Space Probe";
  if (body.type === "comet") return "Periodic Comet";
  if (body.type === "dwarf-planet") return "Dwarf Planet";
  if (body.type === "moon") {
    if (body.radius < 50) return "Minor Moon";
    return "Moon";
  }
  const gasGiants = ["jupiter", "saturn"];
  const iceGiants = ["uranus", "neptune"];
  if (gasGiants.includes(body.id)) return "Gas Giant";
  if (iceGiants.includes(body.id)) return "Ice Giant";
  return "Terrestrial Planet";
}

function formatRotationPeriod(hours: number): string {
  const abs = Math.abs(hours);
  if (abs >= 48) {
    return `${(abs / 24).toFixed(2)} days${hours < 0 ? " (retrograde)" : ""}`;
  }
  return `${abs.toFixed(2)} hours${hours < 0 ? " (retrograde)" : ""}`;
}

interface LayerInfo {
  id: string;
  title: string;
  accent: string;
  body: string;
}

const LAYER_DEFINITIONS: LayerInfo[] = [
  {
    id: "asteroidBelt",
    title: "Asteroid Belt",
    accent: "#b8956a",
    body: "Rocky debris field between Mars and Jupiter, 2.1 \u2013 3.3 AU from the Sun. Contains millions of fragments left over from the early solar system \u2014 Jupiter's gravity prevented them from forming a planet.",
  },
  {
    id: "kuiperBelt",
    title: "Kuiper Belt",
    accent: "#7ab8d4",
    body: "A vast ring of icy bodies beyond Neptune, 30 \u2013 50 AU out. Home to Pluto and the source of most short-period comets. Similar to the asteroid belt but 20 times wider and far more massive.",
  },
  {
    id: "heliosphere",
    title: "Heliosphere",
    accent: "#f4a261",
    body: "The bubble of solar wind the Sun blows into interstellar space. Its outer edge \u2014 the heliopause \u2014 sits around 120 AU out, where Voyager 1 crossed into interstellar space in August 2012.",
  },
  {
    id: "oortCloud",
    title: "Oort Cloud",
    accent: "#a8b5d0",
    body: "A theoretical spherical shell of icy bodies surrounding the solar system from 2,000 to 100,000 AU. Believed to be the source of all long-period comets and marks the Sun's true gravitational edge.",
  },
  {
    id: "eclipticPlane",
    title: "Ecliptic Plane",
    accent: "#8aa4ff",
    body: "The reference plane of Earth's orbit around the Sun. Most major bodies orbit close to it \u2014 deviations from this plane reveal the true 3D architecture of the solar system.",
  },
];

export function InfoPanel() {
  const info = useInfoStore();
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  const rightPanelOpen = useSimStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useSimStore((s) => s.toggleRightPanel);
  const showAsteroidBelt = useSimStore((s) => s.showAsteroidBelt);
  const showKuiperBelt = useSimStore((s) => s.showKuiperBelt);
  const showHeliosphere = useSimStore((s) => s.showHeliosphere);
  const showOortCloud = useSimStore((s) => s.showOortCloud);
  const showEclipticPlane = useSimStore((s) => s.showEclipticPlane);
  const viewMode = useSimStore((s) => s.viewMode);

  const activeLayerStates: Record<string, boolean> = {
    asteroidBelt: showAsteroidBelt,
    kuiperBelt: showKuiperBelt,
    heliosphere: showHeliosphere,
    oortCloud: showOortCloud,
    eclipticPlane: showEclipticPlane && viewMode === "3d",
  };
  const activeLayers = LAYER_DEFINITIONS.filter((l) => activeLayerStates[l.id]);

  if (!rightPanelOpen) {
    return (
      <div className="panel-expand right-expand" onClick={toggleRightPanel}>
        <span className="expand-icon">«</span>
      </div>
    );
  }

  const body = info.body;
  if (!body) return <div className="right-panel-stack"><div className="panel right-panel-top" /><div className="panel right-panel-bottom" /></div>;

  const bodyDescription = getBodyDescription(body.id);
  const state = info.bodyState;
  const orbit = body.orbit;
  const isHyperbolic = orbit ? orbit.eccentricity >= 1.0 : false;
  const isProbe = body.type === "probe";
  const isMoon = body.type === "moon";
  const isStar = body.type === "star";
  const details = body.details;

  const typeLabel = getTypeLabel(body);

  const surfaceGravity =
    !isProbe && body.mass > 0 && body.radius > 1 ? ((G_KM3 * body.mass) / body.radius ** 2) * 1e6 : null;
  const escapeVelocity =
    !isProbe && body.mass > 0 && body.radius > 1 ? Math.sqrt((2 * G_KM3 * body.mass) / body.radius) : null;

  // density = mass / (4/3 * pi * r^3), r in m, mass in kg → kg/m^3
  const meanDensity =
    !isProbe && body.mass > 0 && body.radius > 1 ? body.mass / ((4 / 3) * Math.PI * (body.radius * 1000) ** 3) : null;

  let perihelion: number | null = null;
  let aphelion: string | null = null;
  let orbitalEnergy: number | null = null;
  let hillSphere: number | null = null;

  const orbitsSun = body.parentId === "sun" || body.parentId === undefined;
  const periLabel = orbitsSun ? "Perihelion" : "Periapsis";
  const apoLabel = orbitsSun ? "Aphelion" : "Apoapsis";

  if (orbit) {
    const a = orbit.semiMajorAxis;
    const e = orbit.eccentricity;
    const mu = orbit.mu ?? MU_SUN;

    if (isHyperbolic) {
      perihelion = Math.abs(a) * (e - 1);
      aphelion = "Escape trajectory";
      orbitalEnergy = mu / (2 * Math.abs(a));
    } else {
      perihelion = a * (1 - e);
      aphelion = formatDistance(a * (1 + e));
      orbitalEnergy = -mu / (2 * a);
    }

    if ((body.type === "planet" || body.type === "dwarf-planet") && body.parentId) {
      const parent = info.parentBody;
      if (parent) {
        hillSphere = a * Math.cbrt(body.mass / (3 * parent.mass));
      }
    }
  }

  const smaDisplay =
    orbit && !isHyperbolic
      ? isMoon
        ? `${orbit.semiMajorAxis.toLocaleString()} km`
        : `${(orbit.semiMajorAxis / AU_KM).toFixed(4)} AU`
      : null;

  const childSectionTitle = isStar ? "Planet Distances" : isMoon ? "Sub-satellite Distances" : "Moon Distances";

  return (
    <div className="right-panel-stack">
      {/* Top panel: body data */}
      <div className="panel right-panel-top">
        <div className="panel-header">
          <div className="panel-title">
            <span className={`body-dot large ${isProbe ? "diamond" : ""}`} style={{ backgroundColor: body.color }} />
            {body.name}
          </div>
          <button type="button" className="panel-collapse-btn" onClick={toggleRightPanel} title="Collapse panel">
            »
          </button>
        </div>
        <div className="right-panel-content">
          <div className="info-type">{typeLabel}</div>

          {!isProbe && body.type !== "comet" && (
            <div className="info-section">
              <div className="info-section-title">Physical</div>
              <InfoRow label="Radius" value={`${body.radius.toLocaleString()} km`} />
              <InfoRow label="Mass" value={formatMass(body.mass)} />
              {meanDensity !== null && <InfoRow label="Density" value={`${meanDensity.toFixed(0)} kg/m³`} />}
              {surfaceGravity !== null && <InfoRow label="Surface gravity" value={`${surfaceGravity.toFixed(2)} m/s²`} />}
              {escapeVelocity !== null && <InfoRow label="Escape velocity" value={`${escapeVelocity.toFixed(2)} km/s`} />}
              {details?.meanTemperature !== undefined && (
                <InfoRow
                  label="Temperature"
                  value={`${details.meanTemperature} K (${(details.meanTemperature - 273.15).toFixed(0)} °C)`}
                />
              )}
              {details?.rotationPeriod !== undefined && (
                <InfoRow label="Rotation period" value={formatRotationPeriod(details.rotationPeriod)} />
              )}
              {details?.axialTilt !== undefined && (
                <InfoRow label="Axial tilt" value={`${details.axialTilt.toFixed(2)}°`} />
              )}
              {details?.knownMoons !== undefined && <InfoRow label="Known moons" value={`${details.knownMoons}`} />}
              {details?.discoveryYear !== undefined && <InfoRow label="Discovered" value={`${details.discoveryYear}`} />}
            </div>
          )}

          {isProbe && (
            <div className="info-section">
              <div className="info-section-title">Spacecraft</div>
              <InfoRow label="Mass" value={`${body.mass.toLocaleString()} kg`} />
              {details?.launchDate && <InfoRow label="Launch date" value={details.launchDate} />}
              {details?.status && <InfoRow label="Status" value={details.status} />}
            </div>
          )}

          {body.type === "comet" && (
            <div className="info-section">
              <div className="info-section-title">Comet</div>
              <InfoRow label="Nucleus radius" value={`${body.radius} km`} />
              {details?.discoveryYear !== undefined && (
                <InfoRow
                  label="Discovered"
                  value={details.discoveryYear < 0 ? `${Math.abs(details.discoveryYear)} BC` : `${details.discoveryYear}`}
                />
              )}
              {details?.lastPerihelion && <InfoRow label="Last perihelion" value={details.lastPerihelion} />}
              {details?.nextPerihelion && <InfoRow label="Next perihelion" value={details.nextPerihelion} />}
            </div>
          )}

          {orbit && (
            <div className="info-section">
              <div className="info-section-title">Orbital</div>
              {smaDisplay !== null && <InfoRow label="Semi-major axis" value={smaDisplay} />}
              <InfoRow label="Eccentricity" value={orbit.eccentricity.toFixed(4)} />
              <InfoRow label="Inclination" value={`${orbit.inclination.toFixed(3)}°`} />
              {!isHyperbolic && <InfoRow label="Period" value={formatPeriod(orbit.period)} />}
              {perihelion !== null && <InfoRow label={periLabel} value={formatDistance(perihelion)} />}
              {aphelion !== null && <InfoRow label={apoLabel} value={aphelion} />}
              {orbitalEnergy !== null && (
                <InfoRow label="Orbital energy" value={`${orbitalEnergy.toExponential(3)} km²/s²`} />
              )}
              {hillSphere !== null && <InfoRow label="Hill sphere" value={formatDistance(hillSphere)} />}
            </div>
          )}

          {state && !isStar && (
            <div className="info-section">
              <div className="info-section-title">Live Position</div>
              {info.sunDistance !== null && info.sunDistance > 0 && (
                <InfoRow
                  label="From Sun"
                  value={`${formatDistance(info.sunDistance)} (${(info.sunDistance / AU_KM).toFixed(4)} AU)`}
                />
              )}
              {info.parentBody && info.parentDistance !== null && info.parentBody.id !== info.centerBodyId && (
                <InfoRow label={`From ${info.parentBody.name}`} value={formatDistance(info.parentDistance)} />
              )}
              <InfoRow label="Velocity" value={`${state.velocity.toFixed(2)} km/s`} />
              <InfoRow label="X (ecliptic)" value={formatDistance(state.position.x)} />
              <InfoRow label="Y (ecliptic)" value={formatDistance(state.position.y)} />
              <InfoRow label="True anomaly" value={formatDegrees(state.trueAnomaly)} />
            </div>
          )}

          {info.childDistances.length > 0 && (
            <div className="info-section">
              <div className="info-section-title">{childSectionTitle}</div>
              {info.childDistances.map((m) => (
                <InfoRow key={m.name} label={m.name} value={formatDistance(m.distance)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info panel toggle + collapsible bottom panel */}
      <div className={`panel right-panel-bottom${infoPanelOpen ? "" : " collapsed"}`}>
        <div className="panel-header info-panel-header" onClick={() => setInfoPanelOpen((v) => !v)}>
          <div className="panel-title">Info</div>
          <span className={`info-panel-chevron${infoPanelOpen ? " open" : ""}`}>&#9662;</span>
        </div>
        {infoPanelOpen && (
          <div className="right-panel-content">
            {bodyDescription && (
              <InfoBox
                id={`body-${body.id}`}
                title={`About ${body.name}`}
                color={body.color}
                description={bodyDescription}
                defaultOpen
              />
            )}
            {activeLayers.map((layer) => (
              <InfoBox
                key={layer.id}
                id={`layer-${layer.id}`}
                title={layer.title}
                color={layer.accent}
                description={layer.body}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({
  id,
  title,
  color,
  description,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  color: string;
  description: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Reset open state when the info box identity changes (e.g. selecting a different body).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on id change
  useEffect(() => {
    setOpen(defaultOpen);
  }, [id]);

  return (
    <div className={`info-box${open ? " open" : ""}`} style={{ ["--box-color" as string]: color }}>
      <div className="info-box-header" onClick={() => setOpen((v) => !v)}>
        <span className="info-box-dot" style={{ backgroundColor: color }} />
        <span className="info-box-title">{title}</span>
        <span className="info-box-chevron">{open ? "\u25BE" : "\u25B8"}</span>
      </div>
      <div className="info-box-body">
        <div className="info-box-body-inner">
          <p className="info-box-text">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
