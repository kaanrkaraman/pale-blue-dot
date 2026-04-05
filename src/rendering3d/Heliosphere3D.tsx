import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import {
  TERMINATION_SHOCK_KM,
  HELIOPAUSE_KM,
  HELIOSPHERE_NOSE_LONGITUDE_DEG,
  AU_KM,
} from "../core/data";
import { KM_TO_SCENE } from "./constants";

const DEG_TO_RAD = Math.PI / 180;
const NOSE_ANGLE = HELIOSPHERE_NOSE_LONGITUDE_DEG * DEG_TO_RAD;

interface BoundaryDef {
  label: string;
  noseRadius: number;
  tailRadius: number;
  wireColor: THREE.Color;
  labelColor: string;
  labelBg: string;
}

const BOUNDARIES: BoundaryDef[] = [
  {
    label: "Termination Shock",
    noseRadius: TERMINATION_SHOCK_KM * 0.93,
    tailRadius: TERMINATION_SHOCK_KM * 1.07,
    wireColor: new THREE.Color(100 / 255, 180 / 255, 255 / 255),
    labelColor: "rgba(100, 180, 255, 0.9)",
    labelBg: "rgba(10, 15, 30, 0.8)",
  },
  {
    label: "Heliopause",
    noseRadius: HELIOPAUSE_KM * 0.99,
    tailRadius: HELIOPAUSE_KM * 1.25,
    wireColor: new THREE.Color(180 / 255, 120 / 255, 255 / 255),
    labelColor: "rgba(180, 120, 255, 0.9)",
    labelBg: "rgba(15, 10, 30, 0.8)",
  },
];

function HelioSphere({ boundary }: { boundary: BoundaryDef }) {
  const { camera } = useThree();
  const wireMat = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [inside, setInside] = useState(false);

  const noseR = boundary.noseRadius * KM_TO_SCENE;
  const tailR = boundary.tailRadius * KM_TO_SCENE;

  const semiMajor = (noseR + tailR) / 2;
  const semiMinor = Math.sqrt(noseR * tailR);

  const centerOffset = (tailR - noseR) / 2;
  const offsetX = centerOffset * Math.cos(NOSE_ANGLE + Math.PI);
  const offsetZ = -centerOffset * Math.sin(NOSE_ANGLE + Math.PI);

  const auDist = Math.round(((boundary.noseRadius + boundary.tailRadius) / 2) / AU_KM);
  const labelY = semiMinor * 1.05;

  useFrame(() => {
    const cx = camera.position.x - offsetX;
    const cy = camera.position.y;
    const cz = camera.position.z - offsetZ;

    // Rotate into ellipsoid-local space
    const cosA = Math.cos(NOSE_ANGLE);
    const sinA = Math.sin(NOSE_ANGLE);
    const lx = cosA * cx - sinA * cz;
    const ly = cy;
    const lz = sinA * cx + cosA * cz;

    // d < 1 means camera is inside ellipsoid
    const d = (lx / semiMajor) ** 2 + (ly / semiMinor) ** 2 + (lz / semiMinor) ** 2;
    setInside(d < 1);

    if (wireMat.current) {
      const camDist = camera.position.length();
      const boundaryDist = semiMinor;
      const ratio = camDist / boundaryDist;
      let opacity: number;
      if (ratio < 0.15) {
        opacity = 0;
      } else if (ratio < 0.4) {
        opacity = ((ratio - 0.15) / 0.25) * 0.12;
      } else if (ratio < 1.5) {
        opacity = 0.12;
      } else {
        opacity = Math.max(0, 0.12 * (1 - (ratio - 1.5) / 2));
      }
      wireMat.current.opacity = opacity;
    }

    if (labelRef.current) {
      const camDist = camera.position.length();
      const ratio = camDist / semiMinor;
      const show = ratio > 0.3 && ratio < 3;
      labelRef.current.style.opacity = show ? "1" : "0";
    }
  });

  if (inside) return null;

  return (
    <group position={[offsetX, 0, offsetZ]} rotation={[0, -NOSE_ANGLE, 0]}>
      <mesh scale={[semiMajor, semiMinor, semiMinor]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshBasicMaterial
          ref={wireMat}
          color={boundary.wireColor}
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      <Html
        position={[0, labelY, 0]}
        style={{ pointerEvents: "none", whiteSpace: "nowrap", userSelect: "none" }}
        center
        occlude={false}
        zIndexRange={[100, 0]}
      >
        <div
          ref={labelRef}
          style={{
            color: boundary.labelColor,
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            background: boundary.labelBg,
            padding: "2px 8px",
            borderRadius: "4px",
            border: `1px solid ${boundary.labelColor.replace("0.9", "0.3")}`,
            letterSpacing: "0.05em",
            transition: "opacity 0.3s",
          }}
        >
          {boundary.label} (~{auDist} AU)
        </div>
      </Html>
    </group>
  );
}

export function Heliosphere3D() {
  return (
    <group>
      {BOUNDARIES.map((b) => (
        <HelioSphere key={b.label} boundary={b} />
      ))}
    </group>
  );
}
