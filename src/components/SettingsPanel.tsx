import { useEffect, useRef, useState } from "react";
import { useSimStore } from "../store";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SETTING_INFO: Record<string, string> = {
  "3D Mode": "Switch between 2D orbital plane and full 3D perspective view",
  "Human Eye Scale": "Enlarge celestial bodies to be visible at system scale",
  "Immersive Background": "Procedural starfield with subtle nebula effects",
  "Full Orbits": "Show complete orbital paths instead of trailing arcs",
  "Selection Indicator": "Highlight the selected body with a wireframe marker",
  "Space Probes": "Voyager 1/2, Pioneer 10/11, and New Horizons trajectories",
  "Dwarf Planets": "Pluto, Eris, Ceres, Haumea, and Makemake with their orbits",
  "3D Probe Models": "Render detailed 3D models for each space probe",
  "Asteroid Belt": "Rocky debris field between Mars and Jupiter, 2.1 \u2013 3.3 AU from the Sun",
  "Kuiper Belt": "Icy bodies beyond Neptune, 30 \u2013 50 AU. Home of Pluto and other dwarf planets",
  Heliosphere: "Solar wind boundary where interstellar medium begins, roughly 120 AU out",
  "Oort Cloud": "Theoretical spherical shell of comets extending 2,000 \u2013 100,000 AU from the Sun",
  "Ecliptic Plane": "Reference grid on the plane of Earth's orbit around the Sun",
  Comets: "Famous periodic comets including Halley, Encke, Hale-Bopp, and more",
};

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [hoveredSetting, setHoveredSetting] = useState<string | null>(null);

  const viewMode = useSimStore((s) => s.viewMode);
  const humanEyeScale = useSimStore((s) => s.humanEyeScale);
  const immersiveBackground = useSimStore((s) => s.immersiveBackground);
  const showProbes = useSimStore((s) => s.showProbes);
  const showDwarfPlanets = useSimStore((s) => s.showDwarfPlanets);
  const showHeliosphere = useSimStore((s) => s.showHeliosphere);
  const showAsteroidBelt = useSimStore((s) => s.showAsteroidBelt);
  const showKuiperBelt = useSimStore((s) => s.showKuiperBelt);
  const showOortCloud = useSimStore((s) => s.showOortCloud);
  const showProbeModels = useSimStore((s) => s.showProbeModels);
  const showSelectionIndicator = useSimStore((s) => s.showSelectionIndicator);
  const showEclipticPlane = useSimStore((s) => s.showEclipticPlane);
  const showFullOrbits = useSimStore((s) => s.showFullOrbits);
  const showComets = useSimStore((s) => s.showComets);

  const toggleViewMode = useSimStore((s) => s.toggleViewMode);
  const toggleHumanEyeScale = useSimStore((s) => s.toggleHumanEyeScale);
  const toggleImmersiveBackground = useSimStore((s) => s.toggleImmersiveBackground);
  const toggleShowProbes = useSimStore((s) => s.toggleShowProbes);
  const toggleShowDwarfPlanets = useSimStore((s) => s.toggleShowDwarfPlanets);
  const toggleShowHeliosphere = useSimStore((s) => s.toggleShowHeliosphere);
  const toggleAsteroidBelt = useSimStore((s) => s.toggleAsteroidBelt);
  const toggleKuiperBelt = useSimStore((s) => s.toggleKuiperBelt);
  const toggleOortCloud = useSimStore((s) => s.toggleOortCloud);
  const toggleProbeModels = useSimStore((s) => s.toggleProbeModels);
  const toggleSelectionIndicator = useSimStore((s) => s.toggleSelectionIndicator);
  const toggleEclipticPlane = useSimStore((s) => s.toggleEclipticPlane);
  const toggleFullOrbits = useSimStore((s) => s.toggleFullOrbits);
  const toggleShowComets = useSimStore((s) => s.toggleShowComets);

  const is2D = viewMode === "2d";

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleEscape);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const infoText = hoveredSetting ? SETTING_INFO[hoveredSetting] : null;

  return (
    <div className="settings-panel" ref={panelRef}>
      <div className="settings-header">
        <span className="settings-title">Settings</span>
        <button type="button" className="settings-close" onClick={onClose}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="settings-columns">
        {/* Display Column */}
        <div className="settings-column">
          <div className="settings-column-title">Display</div>
          <SettingsRow
            label="3D Mode"
            shortcut="V"
            active={viewMode === "3d"}
            onToggle={toggleViewMode}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Human Eye Scale"
            shortcut="M"
            active={humanEyeScale}
            onToggle={toggleHumanEyeScale}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Immersive Background"
            shortcut="I"
            active={immersiveBackground}
            onToggle={toggleImmersiveBackground}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Full Orbits"
            shortcut="O"
            active={showFullOrbits}
            onToggle={toggleFullOrbits}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Selection Indicator"
            shortcut="S"
            active={showSelectionIndicator}
            onToggle={toggleSelectionIndicator}
            onHover={setHoveredSetting}
          />
        </div>

        {/* Objects Column */}
        <div className="settings-column">
          <div className="settings-column-title">Objects</div>
          <SettingsRow
            label="Space Probes"
            shortcut="P"
            active={showProbes}
            onToggle={toggleShowProbes}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Dwarf Planets"
            shortcut="D"
            active={showDwarfPlanets}
            onToggle={toggleShowDwarfPlanets}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Comets"
            shortcut="G"
            active={showComets}
            onToggle={toggleShowComets}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="3D Probe Models"
            shortcut="R"
            active={showProbeModels}
            onToggle={toggleProbeModels}
            is3D
            disabled={is2D}
            onHover={setHoveredSetting}
          />
        </div>

        {/* Layers Column */}
        <div className="settings-column">
          <div className="settings-column-title">Layers</div>
          <SettingsRow
            label="Asteroid Belt"
            shortcut="A"
            active={showAsteroidBelt}
            onToggle={toggleAsteroidBelt}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Kuiper Belt"
            shortcut="K"
            active={showKuiperBelt}
            onToggle={toggleKuiperBelt}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Heliosphere"
            shortcut="H"
            active={showHeliosphere}
            onToggle={toggleShowHeliosphere}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Oort Cloud"
            shortcut="C"
            active={showOortCloud}
            onToggle={toggleOortCloud}
            onHover={setHoveredSetting}
          />
          <SettingsRow
            label="Ecliptic Plane"
            shortcut="E"
            active={showEclipticPlane}
            onToggle={toggleEclipticPlane}
            is3D
            disabled={is2D}
            onHover={setHoveredSetting}
          />
        </div>
      </div>

      {/* Info Strip */}
      <div className={`settings-info${infoText ? " visible" : ""}`}>
        <svg
          className="settings-info-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span className="settings-info-text">{infoText}</span>
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  shortcut,
  active,
  onToggle,
  onHover,
  is3D,
  disabled,
}: {
  label: string;
  shortcut: string;
  active: boolean;
  onToggle: () => void;
  onHover: (label: string | null) => void;
  is3D?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`settings-row${disabled ? " settings-row-disabled" : ""}${active ? " settings-row-active" : ""}`}
      onClick={disabled ? undefined : onToggle}
      onMouseEnter={() => onHover(label)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="settings-row-left">
        <span className={`settings-indicator${active ? " on" : ""}`} />
        <span className="settings-label">
          {label}
          {is3D && <span className="settings-3d-badge">3D</span>}
        </span>
      </div>
      <span className="settings-shortcut">{shortcut}</span>
    </div>
  );
}
