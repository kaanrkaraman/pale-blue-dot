import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import type { BodyState3D } from "../core/types3d";
import { useSimStore } from "../store";
import { toThreePos } from "./constants";

// Expose a zoom function for external UI (ZoomControls buttons)
let _zoomFn: ((delta: number) => void) | null = null;
export function zoom3D(delta: number) {
  _zoomFn?.(delta);
}

export function CameraController({ bodyStates3D }: { bodyStates3D: Map<string, BodyState3D> }) {
  const controlsRef = useRef<any>(null);
  const prevTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const selectedBodyId = useSimStore((s) => s.selectedBodyId);
  const prevSelectedRef = useRef(selectedBodyId);
  const { camera } = useThree();

  const handleZoom = useCallback(
    (delta: number) => {
      if (!controlsRef.current) return;
      const target = controlsRef.current.target as THREE.Vector3;
      const dir = camera.position.clone().sub(target);
      const factor = delta > 0 ? 1.25 : 0.8; // zoom out : zoom in
      dir.multiplyScalar(factor);
      const newDist = dir.length();
      if (newDist < 0.01 || newDist > 20_000_000) return;
      camera.position.copy(target.clone().add(dir));
      controlsRef.current.update();
    },
    [camera],
  );

  useEffect(() => {
    _zoomFn = handleZoom;
    return () => {
      _zoomFn = null;
    };
  }, [handleZoom]);

  useEffect(() => {
    if (prevSelectedRef.current !== selectedBodyId && controlsRef.current) {
      const state = bodyStates3D.get(selectedBodyId);
      if (state) {
        const pos = toThreePos(state.position);
        const newTarget = new THREE.Vector3(...pos);

        const oldTarget = controlsRef.current.target.clone();
        const offset = camera.position.clone().sub(oldTarget);

        controlsRef.current.target.copy(newTarget);
        camera.position.copy(newTarget.clone().add(offset));

        prevTargetRef.current.copy(newTarget);
        controlsRef.current.update();
      }
      prevSelectedRef.current = selectedBodyId;
    }
  }, [selectedBodyId, bodyStates3D, camera]);

  useFrame(() => {
    const state = bodyStates3D.get(selectedBodyId);
    if (!state || !controlsRef.current) return;

    const pos = toThreePos(state.position);
    const desired = new THREE.Vector3(...pos);

    const delta = desired.clone().sub(prevTargetRef.current);

    if (delta.lengthSq() > 1e-12) {
      controlsRef.current.target.add(delta);
      camera.position.add(delta);
      prevTargetRef.current.copy(desired);
      controlsRef.current.update();
    }

    (window as any).__planetsi_camera_distance = camera.position.distanceTo(controlsRef.current.target);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.12}
      minDistance={0.01}
      maxDistance={20_000_000}
      rotateSpeed={0.8}
      zoomSpeed={0.8}
      panSpeed={0.8}
      enablePan
      makeDefault
    />
  );
}
