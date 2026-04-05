import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { Color } from "three";
import { computeOrbitPath3D, computeTrailPoints3DCached } from "../core/simulation3d";
import type { CelestialBodyData } from "../core/types";
import type { BodyState3D } from "../core/types3d";
import { useSimStore } from "../store";
import { KM_TO_SCENE, toThreePos } from "./constants";

function TrailLine({
  body,
  parentPos,
  bodyPos,
  simTime,
  maxOrbitRadius,
}: {
  body: CelestialBodyData;
  parentPos: [number, number, number];
  bodyPos: [number, number, number];
  simTime: number;
  maxOrbitRadius: number;
}) {
  // 1. Get the local orbital points (cached in simulation3d)
  const pts = computeTrailPoints3DCached(body, simTime, maxOrbitRadius);

  // 2. Transform them to world scene coordinates and prepare colors
  // We only re-run this if the points themselves change OR the parent moves OR the tip (bodyPos) moves
  const trailData = useMemo(() => {
    const numPoints = pts.length / 3;
    if (numPoints < 1) return null;

    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3); // RGB

    const baseColor = parseColor(body.color);
    const maxAlpha = body.type === "moon" ? 0.35 : body.type === "probe" || body.type === "comet" ? 0.45 : 0.5;

    for (let i = 0; i < numPoints; i++) {
      if (i === 0) {
        // Pin first point exactly to body
        positions[0] = bodyPos[0];
        positions[1] = bodyPos[1];
        positions[2] = bodyPos[2];
      } else {
        positions[i * 3] = parentPos[0] + pts[i * 3] * KM_TO_SCENE;
        positions[i * 3 + 1] = parentPos[1] + pts[i * 3 + 2] * KM_TO_SCENE;
        positions[i * 3 + 2] = parentPos[2] - pts[i * 3 + 1] * KM_TO_SCENE;
      }

      const progress = i / (numPoints || 1);
      const alpha = maxAlpha * (1 - progress) ** 1.5;

      colors[i * 3] = baseColor[0] * alpha;
      colors[i * 3 + 1] = baseColor[1] * alpha;
      colors[i * 3 + 2] = baseColor[2] * alpha;
    }

    return {
      positions: Array.from(positions),
      colors: Array.from(colors),
    };
  }, [
    pts,
    parentPos[0],
    parentPos[1],
    parentPos[2],
    bodyPos[0],
    bodyPos[1],
    bodyPos[2],
    body.id,
    body.color,
    body.type,
  ]);

  if (!trailData) return null;

  return (
    <Line
      points={trailData.positions}
      vertexColors={trailData.colors as any}
      lineWidth={1.2}
      transparent
      opacity={1}
      depthWrite={false}
    />
  );
}

function FullOrbitLine({ body, parentPos }: { body: CelestialBodyData; parentPos: [number, number, number] }) {
  const pts = useMemo(() => {
    if (!body.orbit || body.orbit.eccentricity >= 1.0) return null;

    let numPoints = body.type === "moon" ? 120 : 360;
    const e = body.orbit.eccentricity;
    if (e > 0.98) numPoints *= 8;
    else if (e > 0.9) numPoints *= 4;
    else if (e > 0.7) numPoints *= 2;

    return computeOrbitPath3D(body.orbit, numPoints);
  }, [body.orbit, body.type, body.id]);

  const orbitPositions = useMemo(() => {
    if (!pts || pts.length < 6) return null;

    const numPoints = pts.length / 3;
    const totalPoints = numPoints + 1;
    const positions = new Float32Array(totalPoints * 3);

    for (let i = 0; i < numPoints; i++) {
      positions[i * 3] = parentPos[0] + pts[i * 3] * KM_TO_SCENE;
      positions[i * 3 + 1] = parentPos[1] + pts[i * 3 + 2] * KM_TO_SCENE;
      positions[i * 3 + 2] = parentPos[2] - pts[i * 3 + 1] * KM_TO_SCENE;
    }

    positions[numPoints * 3] = positions[0];
    positions[numPoints * 3 + 1] = positions[1];
    positions[numPoints * 3 + 2] = positions[2];

    return Array.from(positions);
  }, [pts, parentPos[0], parentPos[1], parentPos[2]]);

  if (!orbitPositions) return null;

  const alpha = body.type === "moon" ? 0.12 : 0.18;

  return <Line points={orbitPositions} color={new Color(0.4, 0.5, 0.7)} lineWidth={0.6} transparent opacity={alpha} />;
}

function parseColor(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }
  return [0.7, 0.7, 0.7];
}

export function OrbitLines3D({
  bodyStates3D,
  showProbes,
  showDwarfPlanets,
  showComets,
}: {
  bodyStates3D: Map<string, BodyState3D>;
  showProbes: boolean;
  showDwarfPlanets: boolean;
  showComets: boolean;
}) {
  const activeBodies = useSimStore((s) => s.activeBodies);
  const simTime = useSimStore((s) => s.simTime);
  const maxOrbitRadius = useSimStore((s) => s.system.maxOrbitRadius);
  const showFullOrbits = useSimStore((s) => s.showFullOrbits);

  const visibleBodies = activeBodies.filter((b) => {
    if (b.type === "probe") return showProbes;
    if (b.type === "dwarf-planet") return showDwarfPlanets;
    if (b.type === "comet") return showComets;
    return true;
  });

  return (
    <>
      {visibleBodies.map((body) => {
        if (!body.orbit) return null;

        const parentId = body.parentId ?? "sun";
        const parentState = bodyStates3D.get(parentId);
        const parentPos: [number, number, number] = parentState ? toThreePos(parentState.position) : [0, 0, 0];

        const bodyState = bodyStates3D.get(body.id);
        const bodyPos: [number, number, number] = bodyState ? toThreePos(bodyState.position) : [0, 0, 0];

        return (
          <group key={body.id}>
            {showFullOrbits && <FullOrbitLine body={body} parentPos={parentPos} />}
            <TrailLine
              body={body}
              parentPos={parentPos}
              bodyPos={bodyPos}
              simTime={simTime}
              maxOrbitRadius={maxOrbitRadius}
            />
          </group>
        );
      })}
    </>
  );
}
