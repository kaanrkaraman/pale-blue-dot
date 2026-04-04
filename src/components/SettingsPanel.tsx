import { useEffect, useRef } from "react";
import { useSimStore } from "../store";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const humanEyeScale = useSimStore((s) => s.humanEyeScale);
  const immersiveBackground = useSimStore((s) => s.immersiveBackground);
  const showProbes = useSimStore((s) => s.showProbes);
  const showHeliosphere = useSimStore((s) => s.showHeliosphere);

  const toggleHumanEyeScale = useSimStore((s) => s.toggleHumanEyeScale);
  const toggleImmersiveBackground = useSimStore((s) => s.toggleImmersiveBackground);
  const toggleShowProbes = useSimStore((s) => s.toggleShowProbes);
  const toggleShowHeliosphere = useSimStore((s) => s.toggleShowHeliosphere);

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

  return (
    <div className="settings-panel" ref={panelRef}>
      <div className="settings-title">Settings</div>
      <SettingsRow label="Human Eye Scale" shortcut="M" active={humanEyeScale} onToggle={toggleHumanEyeScale} />
      <SettingsRow
        label="Immersive Background"
        shortcut="I"
        active={immersiveBackground}
        onToggle={toggleImmersiveBackground}
      />
      <SettingsRow label="Show Probes" shortcut="P" active={showProbes} onToggle={toggleShowProbes} />
      <SettingsRow label="Heliosphere" shortcut="H" active={showHeliosphere} onToggle={toggleShowHeliosphere} />
    </div>
  );
}

function SettingsRow({
  label,
  shortcut,
  active,
  onToggle,
}: {
  label: string;
  shortcut: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="settings-row" onClick={onToggle}>
      <span className="settings-label">{label}</span>
      <span className="settings-shortcut">{shortcut}</span>
      <span className={`settings-toggle ${active ? "on" : "off"}`}>
        <span className="settings-toggle-knob" />
      </span>
    </div>
  );
}
