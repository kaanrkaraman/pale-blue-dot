import { useCallback, useMemo, useState } from "react";
import { useSimStore } from "../store";
import { SPEED_STEPS } from "../store/useSimStore";
import { formatSpeed } from "../utils/format";
import { SettingsPanel } from "./SettingsPanel";

export function TimeControls() {
  const speed = useSimStore((s) => s.speed);
  const paused = useSimStore((s) => s.paused);
  const simTime = useSimStore((s) => s.simTime);

  const slowDown = useSimStore((s) => s.slowDown);
  const togglePause = useSimStore((s) => s.togglePause);
  const speedUp = useSimStore((s) => s.speedUp);
  const setSpeed = useSimStore((s) => s.setSpeed);
  const resetToNow = useSimStore((s) => s.resetToNow);
  const stepTime = useSimStore((s) => s.stepTime);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleSettings = useCallback(() => setSettingsOpen((v) => !v), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const speedIndex = useMemo(() => {
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
  }, [speed]);

  const speedLabel = formatSpeed(speed);

  const dateInfo = useMemo(() => {
    const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
    const date = new Date(j2000Ms + simTime * 86_400_000);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return { day, month, year, time: `${hours}:${minutes}:${seconds}` };
  }, [simTime]);

  const handleSpeedSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = parseInt(e.target.value, 10);
      setSpeed(SPEED_STEPS[idx]);
    },
    [setSpeed],
  );

  const stepAmount = useMemo(() => Math.max(speed * 10, 1), [speed]);

  const sliderPercent = (speedIndex / (SPEED_STEPS.length - 1)) * 100;

  return (
    <div className="bottom-bar">
      {/* Transport Controls */}
      <div className="transport-section">
        <button type="button" className="transport-btn" onClick={() => stepTime(-stepAmount)} title="Step backward">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="19,20 9,12 19,4" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>
        <button type="button" className="transport-btn" onClick={slowDown} title="Slower (-)">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="19,20 9,12 19,4" />
          </svg>
        </button>
        <button
          type="button"
          className={`transport-btn play-btn${paused ? "" : " active"}`}
          onClick={togglePause}
          title="Play/Pause (Space)"
        >
          {paused ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="3" width="5" height="18" rx="1" />
              <rect x="14" y="3" width="5" height="18" rx="1" />
            </svg>
          )}
        </button>
        <button type="button" className="transport-btn" onClick={speedUp} title="Faster (+)">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5,4 15,12 5,20" />
          </svg>
        </button>
        <button type="button" className="transport-btn" onClick={() => stepTime(stepAmount)} title="Step forward">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5,4 15,12 5,20" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      <div className="bar-divider" />

      {/* Speed Control */}
      <div className="speed-section">
        <div className="speed-slider-container">
          <input
            type="range"
            className="speed-slider"
            min={0}
            max={SPEED_STEPS.length - 1}
            value={speedIndex}
            onChange={handleSpeedSlider}
            style={{ "--slider-percent": `${sliderPercent}%` } as React.CSSProperties}
          />
          <div className="speed-ticks">
            {SPEED_STEPS.map((_, i) => (
              <span key={i} className={`speed-tick${i === speedIndex ? " active" : ""}`} />
            ))}
          </div>
        </div>
        <span className="speed-value">{speedLabel}</span>
      </div>

      <div className="bar-divider" />

      {/* Date Display + Actions */}
      <div className="date-section">
        <div className="date-primary">
          <span className="date-day">{dateInfo.day}</span>
          <div className="date-month-year">
            <span className="date-month">{dateInfo.month}</span>
            <span className="date-year">{dateInfo.year}</span>
          </div>
        </div>
        <span className="date-time">{dateInfo.time} UTC</span>
        <button type="button" className="action-btn now-btn" onClick={resetToNow} title="Jump to current date">
          NOW
        </button>
        <div className="settings-anchor">
          <button
            type="button"
            className={`action-btn settings-btn${settingsOpen ? " active" : ""}`}
            onClick={toggleSettings}
            title="Settings"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <SettingsPanel open={settingsOpen} onClose={closeSettings} />
        </div>
      </div>

      {/* GitHub Link */}
      <div className="bottom-bar-right">
        <a
          href="https://github.com/kaanrkaraman/pale-blue-dot"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
          title="View on GitHub"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          github
        </a>
      </div>
    </div>
  );
}
