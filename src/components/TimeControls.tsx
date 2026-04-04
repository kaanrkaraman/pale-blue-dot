import { useCallback, useState } from "react";
import { useSimStore } from "../store";
import { formatSimDate, formatSpeed } from "../utils/format";
import { SettingsPanel } from "./SettingsPanel";

export function TimeControls() {
  const speed = useSimStore((s) => s.speed);
  const paused = useSimStore((s) => s.paused);
  const simTime = useSimStore((s) => s.simTime);

  const slowDown = useSimStore((s) => s.slowDown);
  const togglePause = useSimStore((s) => s.togglePause);
  const speedUp = useSimStore((s) => s.speedUp);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleSettings = useCallback(() => setSettingsOpen((v) => !v), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const speedLabel = formatSpeed(speed);
  const dateLabel = formatSimDate(simTime);

  return (
    <div className="bottom-bar">
      <div className="time-controls">
        <button type="button" className="time-btn" onClick={slowDown} title="Slower (-)">
          −
        </button>
        <button type="button" className="time-btn primary" onClick={togglePause} title="Play/Pause (Space)">
          {paused ? "▶" : "⏸"}
        </button>
        <button type="button" className="time-btn" onClick={speedUp} title="Faster (+)">
          +
        </button>
        <button
          type="button"
          className="time-btn"
          onClick={() => {
            speedUp();
            speedUp();
            speedUp();
          }}
          title="Fast forward"
        >
          ⏩
        </button>
      </div>
      <div className="time-info">
        <span className="time-speed">{speedLabel}</span>
        <span className="time-date">{dateLabel}</span>
      </div>
      <div className="settings-anchor">
        <button
          type="button"
          className={`time-btn gear-btn ${settingsOpen ? "active" : ""}`}
          onClick={toggleSettings}
          title="Settings"
        >
          ⚙
        </button>
        <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      </div>
    </div>
  );
}
