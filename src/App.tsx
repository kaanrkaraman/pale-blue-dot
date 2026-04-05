import { useEffect } from "react";
import { BodySelector, Canvas, Canvas3D, InfoPanel, ScaleBar, TimeControls } from "./components";
import { ZoomControls } from "./components/ZoomControls";
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
  const toggleShowDwarfPlanets = useSimStore((s) => s.toggleShowDwarfPlanets);
  const toggleShowHeliosphere = useSimStore((s) => s.toggleShowHeliosphere);
  const toggleAsteroidBelt = useSimStore((s) => s.toggleAsteroidBelt);
  const toggleKuiperBelt = useSimStore((s) => s.toggleKuiperBelt);
  const toggleOortCloud = useSimStore((s) => s.toggleOortCloud);
  const toggleViewMode = useSimStore((s) => s.toggleViewMode);
  const toggleSelectionIndicator = useSimStore((s) => s.toggleSelectionIndicator);
  const toggleEclipticPlane = useSimStore((s) => s.toggleEclipticPlane);
  const toggleFullOrbits = useSimStore((s) => s.toggleFullOrbits);
  const toggleShowComets = useSimStore((s) => s.toggleShowComets);
  const viewMode = useSimStore((s) => s.viewMode);
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
        case "d":
          toggleShowDwarfPlanets();
          break;
        case "a":
          toggleAsteroidBelt();
          break;
        case "k":
          toggleKuiperBelt();
          break;
        case "h":
          toggleShowHeliosphere();
          break;
        case "c":
          toggleOortCloud();
          break;
        case "o":
          toggleFullOrbits();
          break;
        case "v":
          toggleViewMode();
          break;
        case "s":
          toggleSelectionIndicator();
          break;
        case "e":
          if (useSimStore.getState().viewMode === "3d") toggleEclipticPlane();
          break;
        case "g":
          toggleShowComets();
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
    toggleShowDwarfPlanets,
    toggleShowHeliosphere,
    toggleAsteroidBelt,
    toggleKuiperBelt,
    toggleOortCloud,
    toggleViewMode,
    toggleSelectionIndicator,
    toggleEclipticPlane,
    toggleFullOrbits,
    toggleShowComets,
  ]);

  const appClasses = ["app", !leftPanelOpen ? "left-collapsed" : "", !rightPanelOpen ? "right-collapsed" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={appClasses}>
      <BodySelector />
      <div className="viewport">
        {viewMode === "2d" ? <Canvas /> : <Canvas3D />}
        <ScaleBar />
        <ZoomControls />
      </div>
      <InfoPanel />
      <TimeControls />
    </div>
  );
}
