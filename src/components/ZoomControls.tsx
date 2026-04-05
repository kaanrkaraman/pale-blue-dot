import { useCallback } from "react";
import { zoom3D } from "../rendering3d/CameraController";
import { useSimStore } from "../store";

export function ZoomControls() {
  const applyZoomDelta = useSimStore((s) => s.applyZoomDelta);
  const viewMode = useSimStore((s) => s.viewMode);

  const zoomIn = useCallback(() => {
    if (viewMode === "3d") zoom3D(-1);
    else applyZoomDelta(-1);
  }, [applyZoomDelta, viewMode]);

  const zoomOut = useCallback(() => {
    if (viewMode === "3d") zoom3D(1);
    else applyZoomDelta(1);
  }, [applyZoomDelta, viewMode]);

  return (
    <div className="zoom-controls">
      <button type="button" className="zoom-btn" onClick={zoomIn} title="Zoom in">
        +
      </button>
      <button type="button" className="zoom-btn" onClick={zoomOut} title="Zoom out">
        −
      </button>
    </div>
  );
}
