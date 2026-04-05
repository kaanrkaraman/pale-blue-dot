import { useEffect, useRef, useState } from "react";
import { useSimStore } from "../store";
import { formatScaleBar } from "../utils/format";

const TARGET_BAR_PX = 150;

// For 3D: KM_TO_SCENE = 1/1_000_000, so 1 scene unit = 1M km
// Camera FOV = 50deg, half FOV = 25deg
// At distance d from target, visible half-height = d * tan(25deg)
// Full visible height in scene units = 2 * d * tan(25deg)
// km per pixel = (visibleHeightSceneUnits / screenHeight) * 1_000_000
const TAN_HALF_FOV = Math.tan((25 * Math.PI) / 180);

export function ScaleBar() {
  const [label, setLabel] = useState("");
  const [barWidth, setBarWidth] = useState(TARGET_BAR_PX);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const state = useSimStore.getState();
      let kmPerPx: number;

      if (state.viewMode === "2d") {
        kmPerPx = state.camera.kmPerPixel;
      } else {
        const cam3d = (window as any).__planetsi_camera_distance;
        if (!cam3d) return;
        const screenH = window.innerHeight - 50;
        const visibleHeightKm = 2 * cam3d * TAN_HALF_FOV * 1_000_000;
        kmPerPx = visibleHeightKm / screenH;
      }

      const rawKm = kmPerPx * TARGET_BAR_PX;
      const magnitude = 10 ** Math.floor(Math.log10(rawKm));
      const candidates = [1, 2, 5, 10, 20, 50];
      let niceKm = magnitude;
      for (const c of candidates) {
        const v = c * magnitude;
        if (v <= rawKm * 1.5) niceKm = v;
      }

      const actualPx = niceKm / kmPerPx;
      setBarWidth(actualPx);
      setLabel(formatScaleBar(niceKm));
    }, 200);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="scale-bar">
      <div className="scale-bar-line" style={{ width: barWidth }} />
      <div className="scale-bar-label">{label}</div>
    </div>
  );
}
