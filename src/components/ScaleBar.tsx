import { useEffect, useRef, useState } from "react";
import { useSimStore } from "../store";
import { formatScaleBar } from "../utils/format";

const TARGET_BAR_PX = 150;

export function ScaleBar() {
  const [label, setLabel] = useState("");
  const [barWidth, setBarWidth] = useState(TARGET_BAR_PX);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const { camera } = useSimStore.getState();
      const rawKm = camera.kmPerPixel * TARGET_BAR_PX;

      const magnitude = 10 ** Math.floor(Math.log10(rawKm));
      const candidates = [1, 2, 5, 10, 20, 50];
      let niceKm = magnitude;
      for (const c of candidates) {
        const v = c * magnitude;
        if (v <= rawKm * 1.5) niceKm = v;
      }

      const actualPx = niceKm / camera.kmPerPixel;
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
