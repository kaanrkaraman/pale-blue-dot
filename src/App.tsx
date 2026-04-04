import { useEffect } from "react";
import { BodySelector, Canvas, InfoPanel, Minimap, ScaleBar, TimeControls } from "./components";
import { SHORTCUT_BODIES } from "./core/data";
import { useSimStore } from "./store";

export function App() {
  const init = useSimStore((s) => s.init);
  const selectBody = useSimStore((s) => s.selectBody);
  const togglePause = useSimStore((s) => s.togglePause);
  const speedUp = useSimStore((s) => s.speedUp);
  const slowDown = useSimStore((s) => s.slowDown);
  const toggleHumanEyeScale = useSimStore((s) => s.toggleHumanEyeScale);
  const toggleImmersiveBackground = useSimStore((s) => s.toggleImmersiveBackground);
  const toggleShowProbes = useSimStore((s) => s.toggleShowProbes);
  const toggleShowHeliosphere = useSimStore((s) => s.toggleShowHeliosphere);
  const leftPanelOpen = useSimStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useSimStore((s) => s.rightPanelOpen);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const num = parseInt(e.key, 10);
      if (!Number.isNaN(num) && num >= 0 && num <= 9) {
        selectBody(SHORTCUT_BODIES[num]);
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePause();
          break;
        case "+":
        case "=":
          speedUp();
          break;
        case "-":
        case "_":
          slowDown();
          break;
        case "m":
          toggleHumanEyeScale();
          break;
        case "i":
          toggleImmersiveBackground();
          break;
        case "p":
          toggleShowProbes();
          break;
        case "h":
          toggleShowHeliosphere();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectBody,
    togglePause,
    speedUp,
    slowDown,
    toggleHumanEyeScale,
    toggleImmersiveBackground,
    toggleShowProbes,
    toggleShowHeliosphere,
  ]);

  const appClasses = ["app", !leftPanelOpen ? "left-collapsed" : "", !rightPanelOpen ? "right-collapsed" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={appClasses}>
      <BodySelector />
      <div className="viewport">
        <Canvas />
        <Minimap />
        <ScaleBar />
      </div>
      <InfoPanel />
      <TimeControls />
    </div>
  );
}
