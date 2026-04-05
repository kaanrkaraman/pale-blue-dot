import { useMemo } from "react";
import { Color } from "three";
import { Line } from "@react-three/drei";
import { useSimStore } from "../store";
import type { BodyState3D } from "../core/types3d";
import type { CelestialBodyData } from "../core/types";
import { computeTrailPoints3D, computeOrbitPath3D } from "../core/simulation3d";
import { toThreePos, KM_TO_SCENE } from "./constants";

function TrailLine({
  body,
  parentPos,
  simTime,
  maxOrbitRadius,
}: {
  body: CelestialBodyData;
  parentPos: [number, number, number];
  simTime: number;
  maxOrbitRadius: number;
}) {
  const trailData = useMemo(() => {
    const pts = computeTrailPoints3D(body, simTime, maxOrbitRadius);
    if (pts.length < 2) return null;

    const positions = pts.map((p): [number, number, number] => [
      parentPos[0] + p.x * KM_TO_SCENE,
      parentPos[1] + p.z * KM_TO_SCENE,
      parentPos[2] - p.y * KM_TO_SCENE,
    ]);

    const baseColor = parseColor(body.color);
    const maxAlpha = body.type === "moon" ? 0.35 : (body.type === "probe" || body.type === "comet") ? 0.45 : 0.5;

    const colors = pts.map((_, i): [number, number, number] => {
      const progress = i / (pts.length - 1);
      const alpha = maxAlpha * (1 - progress) ** 1.5;
      return [
        baseColor[0] * alpha,
        baseColor[1] * alpha,
        baseColor[2] * alpha,
      ];
    });

    return { positions, colors };
  }, [body, simTime, parentPos[0], parentPos[1], parentPos[2], maxOrbitRadius]);

  if (!trailData) return null;

  return (
    <Line
      points={trailData.positions}
      vertexColors={trailData.colors}
      lineWidth={1.2}
      transparent
      opacity={1}
    />
  );
}

function FullOrbitLine({
  body,
  parentPos,
}: {
  body: CelestialBodyData;
  parentPos: [number, number, number];
}) {
  const orbitData = useMemo(() => {
    if (!body.orbit || body.orbit.eccentricity >= 1.0) return null;

    const numPoints = body.type === "moon" ? 120 : 360;
    const pts = computeOrbitPath3D(body.orbit, numPoints);
    if (pts.length < 2) return null;

    const positions = pts.map((p): [number, number, number] => [
      parentPos[0] + p.x * KM_TO_SCENE,
      parentPos[1] + p.z * KM_TO_SCENE,
      parentPos[2] - p.y * KM_TO_SCENE,
    ]);
    positions.push(positions[0]);

    return positions;
  }, [body, parentPos[0], parentPos[1], parentPos[2]]);

  if (!orbitData) return null;

  const alpha = body.type === "moon" ? 0.12 : 0.18;

  return (
    <Line
      points={orbitData}
      color={new Color(0.4, 0.5, 0.7)}
      lineWidth={0.6}
      transparent
      opacity={alpha}
    />
  );
}

function parseColor(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  }
  return [0.7, 0.7, 0.7];
}

export function OrbitLines3D({ bodyStates3D }: { bodyStates3D: Map<string, BodyState3D> }) {
  const activeBodies = useSimStore((s) => s.activeBodies);
  const simTime = useSimStore((s) => s.simTime);
  const maxOrbitRadius = useSimStore((s) => s.system.maxOrbitRadius);
  const showFullOrbits = useSimStore((s) => s.showFullOrbits);

  return (
    <>
      {activeBodies.map((body) => {
        if (!body.orbit) return null;

        const parentId = body.parentId ?? "sun";
        const parentState = bodyStates3D.get(parentId);
        const parentPos: [number, number, number] = parentState
          ? toThreePos(parentState.position)
          : [0, 0, 0];

        return (
          <group key={body.id}>
            {showFullOrbits && <FullOrbitLine body={body} parentPos={parentPos} />}
            <TrailLine
              body={body}
              parentPos={parentPos}
              simTime={simTime}
              maxOrbitRadius={maxOrbitRadius}
            />
          </group>
        );
      })}
    </>
  );
}
