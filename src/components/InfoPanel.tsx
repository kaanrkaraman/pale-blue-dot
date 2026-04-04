import { useEffect, useRef, useState } from "react";
import { AU_KM, G_KM3, getChildrenFrom, MU_SUN } from "../core/data";
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
  moonDistances: { name: string; distance: number }[];
  centerBodyId: string;
}

function selectInfo(s: ReturnType<typeof useSimStore.getState>): InfoSnapshot {
  const body = s.bodyMap.get(s.selectedBodyId);
  const bodyState = s.bodyStates.get(s.selectedBodyId);
  const moonDistances: { name: string; distance: number }[] = [];
  let parentBody: CelestialBodyData | undefined;
  let parentDistance: number | null = null;
  let sunDistance: number | null = null;

  if (body) {
    const moons = getChildrenFrom(s.activeBodies, s.selectedBodyId);
    for (const moon of moons) {
      const moonState = s.bodyStates.get(moon.id);
      if (moonState) {
        moonDistances.push({ name: moon.name, distance: moonState.orbitalRadius });
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
    moonDistances,
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

export function InfoPanel() {
  const info = useInfoStore();
  const rightPanelOpen = useSimStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useSimStore((s) => s.toggleRightPanel);

  if (!rightPanelOpen) {
    return (
      <div className="panel-expand right-expand" onClick={toggleRightPanel}>
        <span className="expand-icon">«</span>
      </div>
    );
  }

  const body = info.body;
  if (!body) return <div className="panel right-panel" />;

  const state = info.bodyState;
  const orbit = body.orbit;
  const isHyperbolic = orbit ? orbit.eccentricity >= 1.0 : false;
  const isProbe = body.type === "probe";

  const typeLabel =
    body.type === "star"
      ? "Star"
      : body.type === "planet"
        ? "Planet"
        : body.type === "dwarf-planet"
          ? "Dwarf Planet"
          : body.type === "probe"
            ? "Space Probe"
            : "Moon";

  const surfaceGravity =
    !isProbe && body.mass > 0 && body.radius > 1 ? ((G_KM3 * body.mass) / body.radius ** 2) * 1e6 : null;
  const escapeVelocity =
    !isProbe && body.mass > 0 && body.radius > 1 ? Math.sqrt((2 * G_KM3 * body.mass) / body.radius) : null;

  let perihelion: number | null = null;
  let aphelion: string | null = null;
  let orbitalEnergy: number | null = null;
  let hillSphere: number | null = null;

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

  return (
    <div className="panel right-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className={`body-dot large ${isProbe ? "diamond" : ""}`} style={{ backgroundColor: body.color }} />
          {body.name}
        </div>
        <button type="button" className="panel-collapse-btn" onClick={toggleRightPanel} title="Collapse panel">
          »
        </button>
      </div>
      <div className="info-type">{typeLabel}</div>

      {!isProbe && (
        <div className="info-section">
          <div className="info-section-title">Physical</div>
          <InfoRow label="Radius" value={`${body.radius.toLocaleString()} km`} />
          <InfoRow label="Mass" value={formatMass(body.mass)} />
          {surfaceGravity !== null && <InfoRow label="Surface gravity" value={`${surfaceGravity.toFixed(2)} m/s²`} />}
          {escapeVelocity !== null && <InfoRow label="Escape velocity" value={`${escapeVelocity.toFixed(2)} km/s`} />}
        </div>
      )}

      {isProbe && (
        <div className="info-section">
          <div className="info-section-title">Spacecraft</div>
          <InfoRow label="Mass" value={`${body.mass.toLocaleString()} kg`} />
        </div>
      )}

      {orbit && (
        <div className="info-section">
          <div className="info-section-title">Orbital</div>
          {!isHyperbolic && (
            <InfoRow label="Semi-major axis" value={`${(orbit.semiMajorAxis / AU_KM).toFixed(4)} AU`} />
          )}
          <InfoRow label="Eccentricity" value={orbit.eccentricity.toFixed(4)} />
          <InfoRow label="Inclination" value={`${orbit.inclination.toFixed(3)}°`} />
          {!isHyperbolic && <InfoRow label="Period" value={formatPeriod(orbit.period)} />}
          {perihelion !== null && <InfoRow label="Perihelion" value={formatDistance(perihelion)} />}
          {aphelion !== null && <InfoRow label="Aphelion" value={aphelion} />}
          {orbitalEnergy !== null && (
            <InfoRow label="Orbital energy" value={`${orbitalEnergy.toExponential(3)} km²/s²`} />
          )}
          {hillSphere !== null && <InfoRow label="Hill sphere" value={formatDistance(hillSphere)} />}
        </div>
      )}

      {state && (
        <div className="info-section">
          <div className="info-section-title">Live Position</div>
          {info.sunDistance !== null && info.sunDistance > 0 && (
            <InfoRow
              label="From Sun"
              value={`${formatDistance(info.sunDistance)} (${(info.sunDistance / AU_KM).toFixed(4)} AU)`}
            />
          )}
          {info.parentBody && info.parentDistance !== null && info.parentBody.id !== info.centerBodyId && (
            <InfoRow
              label={`From ${info.parentBody.name}`}
              value={`${formatDistance(info.parentDistance)} (${(info.parentDistance / AU_KM).toFixed(4)} AU)`}
            />
          )}
          <InfoRow label="Velocity" value={`${state.velocity.toFixed(2)} km/s`} />
          <InfoRow label="X (ecliptic)" value={formatDistance(state.position.x)} />
          <InfoRow label="Y (ecliptic)" value={formatDistance(state.position.y)} />
          <InfoRow label="True anomaly" value={formatDegrees(state.trueAnomaly)} />
        </div>
      )}

      {info.moonDistances.length > 0 && (
        <div className="info-section">
          <div className="info-section-title">Moon Distances</div>
          {info.moonDistances.map((m) => (
            <InfoRow key={m.name} label={m.name} value={formatDistance(m.distance)} />
          ))}
        </div>
      )}
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
