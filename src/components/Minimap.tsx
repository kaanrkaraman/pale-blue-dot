import { useEffect, useRef } from "react";
import { renderMinimap } from "../rendering/renderer";
import { useSimStore } from "../store";

const MINIMAP_SIZE = 160;

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = MINIMAP_SIZE * dpr;
    canvas.height = MINIMAP_SIZE * dpr;
    ctx.scale(dpr, dpr);

    intervalRef.current = setInterval(() => {
      const state = useSimStore.getState();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mainW = window.innerWidth - (state.leftPanelOpen ? 180 : 0) - (state.rightPanelOpen ? 260 : 0);
      const mainH = window.innerHeight - 50;

      renderMinimap(
        ctx,
        MINIMAP_SIZE,
        MINIMAP_SIZE,
        state.activeBodies,
        state.bodyStates,
        state.camera,
        mainW,
        mainH,
        state.selectedBodyId,
        state.system.maxOrbitRadius,
      );
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="minimap">
      <canvas ref={canvasRef} style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }} />
    </div>
  );
}
