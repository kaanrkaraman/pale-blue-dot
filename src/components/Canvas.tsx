import { useCallback, useEffect, useRef } from "react";
import { hitTestBody, renderScene } from "../rendering/renderer";
import { useSimStore } from "../store";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const tick = useSimStore((s) => s.tick);
  const applyZoomDelta = useSimStore((s) => s.applyZoomDelta);
  const selectBody = useSimStore((s) => s.selectBody);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(canvas);

    const loop = (timestamp: number) => {
      const dtMs = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      const dtSec = Math.min(dtMs / 1000, 0.1);

      tick(dtSec);

      const state = useSimStore.getState();
      const rect = canvas.getBoundingClientRect();

      renderScene(
        ctx,
        rect.width,
        rect.height,
        state.camera,
        state.bodyStates,
        state.activeBodies,
        state.selectedBodyId,
        state.humanEyeScale,
        state.simTime,
        state.immersiveBackground,
        state.system.maxOrbitRadius,
        state.showHeliosphere,
        state.showAsteroidBelt,
        state.showKuiperBelt,
        state.showSelectionIndicator,
        state.showFullOrbits,
        state.orbitPaths,
        state.showOortCloud,
        state.showProbes,
        state.showDwarfPlanets,
        state.showComets,
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, [tick]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      applyZoomDelta(e.deltaY > 0 ? 1 : -1);
    },
    [applyZoomDelta],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const state = useSimStore.getState();
      const hit = hitTestBody(
        x,
        y,
        state.camera,
        rect.width,
        rect.height,
        state.activeBodies,
        state.bodyStates,
        state.humanEyeScale,
      );

      if (hit) selectBody(hit);
    },
    [selectBody],
  );

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
      onWheel={handleWheel}
      onClick={handleClick}
    />
  );
}
