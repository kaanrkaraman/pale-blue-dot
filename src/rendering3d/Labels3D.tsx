import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { CelestialBodyData } from "../core/types";
import type { BodyState3D } from "../core/types3d";
import { useSimStore } from "../store";
import { toThreePos } from "./constants";

const TYPE_PRIORITY: Record<string, number> = {
  star: 400,
  planet: 300,
  "dwarf-planet": 200,
  probe: 150,
  moon: 100,
};

interface LabelEntry {
  body: CelestialBodyData;
  screenX: number;
  screenY: number;
  priority: number;
  pos3d: [number, number, number];
}

function labelsOverlap(
  a: { screenX: number; screenY: number; w: number; h: number },
  b: { screenX: number; screenY: number; w: number; h: number },
): boolean {
  const pad = 6;
  return !(
    a.screenX + a.w + pad < b.screenX - pad ||
    b.screenX + b.w + pad < a.screenX - pad ||
    a.screenY + pad < b.screenY - b.h - pad ||
    b.screenY + pad < a.screenY - a.h - pad
  );
}
export function Labels3D({
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
  const selectedBodyId = useSimStore((s) => s.selectedBodyId);
  const { camera, size } = useThree();

  const visibleLabels = useMemo(() => {
    if (bodyStates3D.size === 0) return [];

    const tempVec = new THREE.Vector3();
    const entries: LabelEntry[] = [];

    const visibleActiveBodies = activeBodies.filter((b) => {
      if (b.type === "probe") return showProbes;
      if (b.type === "dwarf-planet") return showDwarfPlanets;
      if (b.type === "comet") return showComets;
      return true;
    });

    for (const body of visibleActiveBodies) {
      const state3d = bodyStates3D.get(body.id);
      if (!state3d) continue;

      const pos3d = toThreePos(state3d.position);
      tempVec.set(...pos3d);

      // Project to NDC
      tempVec.project(camera);

      if (tempVec.z > 1) continue;

      const screenX = (tempVec.x * 0.5 + 0.5) * size.width;
      const screenY = (-tempVec.y * 0.5 + 0.5) * size.height;

      if (screenX < -50 || screenX > size.width + 50 || screenY < -50 || screenY > size.height + 50) continue;

      const isSelected = body.id === selectedBodyId;
      const priority = (isSelected ? 10000 : 0) + (TYPE_PRIORITY[body.type] ?? 0) + Math.log10(body.radius + 1);

      entries.push({ body, screenX, screenY, priority, pos3d });
    }

    entries.sort((a, b) => b.priority - a.priority);

    const placed: { screenX: number; screenY: number; w: number; h: number }[] = [];
    const result: LabelEntry[] = [];

    for (const entry of entries) {
      const fontSize =
        entry.body.type === "star"
          ? 12
          : entry.body.type === "moon" || entry.body.type === "probe" || entry.body.type === "comet"
            ? 9
            : 11;
      const estWidth = entry.body.name.length * fontSize * 0.6;
      const box = { screenX: entry.screenX + 10, screenY: entry.screenY, w: estWidth, h: fontSize };

      let overlaps = false;
      for (const p of placed) {
        if (labelsOverlap(box, p)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        placed.push(box);
        result.push(entry);
      }
    }

    return result;
  }, [
    activeBodies,
    bodyStates3D,
    selectedBodyId,
    camera,
    size.width,
    size.height,
    showProbes,
    showDwarfPlanets,
    showComets,
  ]);

  return (
    <>
      {visibleLabels.map(({ body, pos3d }) => {
        const isSelected = body.id === selectedBodyId;
        const isProbe = body.type === "probe" || body.type === "comet";

        return (
          <Html
            key={body.id}
            position={pos3d}
            style={{
              pointerEvents: "none",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
            center={false}
            occlude={false}
            zIndexRange={[100, 0]}
          >
            <div
              style={{
                color: isProbe ? "#00e5ff" : isSelected ? "#ffffff" : "#b0c0e0",
                fontSize: isSelected
                  ? "12px"
                  : body.type === "moon" || body.type === "probe" || body.type === "comet"
                    ? "9px"
                    : "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: isSelected ? 600 : 400,
                textShadow: "0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)",
                marginLeft: "8px",
                marginTop: "-6px",
              }}
            >
              {body.name}
            </div>
          </Html>
        );
      })}
    </>
  );
}
