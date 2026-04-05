import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const GRID_LINES = 40; // lines in each direction from center

export function EclipticGrid() {
  const fineRef = useRef<THREE.LineSegments>(null);
  const coarseRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();

  const fineGeo = useMemo(() => buildGrid(1, GRID_LINES), []);
  const coarseGeo = useMemo(() => buildGrid(1, GRID_LINES), []);

  useFrame(() => {
    const camDist = camera.position.length();
    // Adaptive spacing: pick a nice step based on view distance
    const rawSpacing = camDist / 15;
    const magnitude = 10 ** Math.floor(Math.log10(rawSpacing));
    const normalized = rawSpacing / magnitude;
    let spacing: number;
    if (normalized < 2) spacing = magnitude;
    else if (normalized < 5) spacing = 2 * magnitude;
    else spacing = 5 * magnitude;

    spacing = Math.max(spacing, 0.5);
    const snapX = Math.round(camera.position.x / spacing) * spacing;
    const snapZ = Math.round(camera.position.z / spacing) * spacing;

    if (fineRef.current) {
      fineRef.current.scale.set(spacing, 1, spacing);
      fineRef.current.position.set(snapX, 0, snapZ);
    }
    if (coarseRef.current) {
      const coarseSpacing = spacing * 5;
      const coarseSnapX = Math.round(camera.position.x / coarseSpacing) * coarseSpacing;
      const coarseSnapZ = Math.round(camera.position.z / coarseSpacing) * coarseSpacing;
      coarseRef.current.scale.set(coarseSpacing, 1, coarseSpacing);
      coarseRef.current.position.set(coarseSnapX, 0, coarseSnapZ);
    }
  });

  return (
    <group>
      <lineSegments ref={fineRef} geometry={fineGeo}>
        <lineBasicMaterial color="#253880" transparent opacity={0.22} depthWrite={false} />
      </lineSegments>
      <lineSegments ref={coarseRef} geometry={coarseGeo}>
        <lineBasicMaterial color="#3050b0" transparent opacity={0.32} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

function buildGrid(spacing: number, count: number): THREE.BufferGeometry {
  const extent = count * spacing;
  const positions: number[] = [];

  for (let i = -count; i <= count; i++) {
    const offset = i * spacing;
    positions.push(-extent, 0, offset, extent, 0, offset);
    positions.push(offset, 0, -extent, offset, 0, extent);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}
