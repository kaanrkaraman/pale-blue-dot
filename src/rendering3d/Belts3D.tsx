import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  ASTEROID_BELT_INNER_KM,
  ASTEROID_BELT_OUTER_KM,
  AU_KM,
  JUPITER_RING_INNER_KM,
  JUPITER_RING_OUTER_KM,
  KUIPER_BELT_INNER_KM,
  KUIPER_BELT_OUTER_KM,
  OORT_CLOUD_INNER_KM,
  OORT_CLOUD_OUTER_KM,
  SATURN_RING_INNER_KM,
  SATURN_RING_OUTER_KM,
} from "../core/data";
import type { BodyState3D } from "../core/types3d";
import { KM_TO_SCENE, toThreePos } from "./constants";

function BeltRing({
  innerRadius,
  outerRadius,
  color,
  opacity,
  label,
  labelColor,
}: {
  innerRadius: number;
  outerRadius: number;
  color: THREE.Color;
  opacity: number;
  label: string;
  labelColor: string;
}) {
  const inner = innerRadius * KM_TO_SCENE;
  const outer = outerRadius * KM_TO_SCENE;
  const midRadius = (inner + outer) / 2;
  const labelRef = useRef<HTMLDivElement>(null);
  const { camera } = useThree();

  const innerAU = (innerRadius / AU_KM).toFixed(1);
  const outerAU = (outerRadius / AU_KM).toFixed(1);

  const origin = new THREE.Vector3(0, 0, 0);
  useFrame(() => {
    if (!labelRef.current) return;
    const camDist = camera.position.distanceTo(origin);
    const ratio = camDist / outer;
    let labelOpacity: number;
    if (ratio < 0.2) {
      labelOpacity = 0;
    } else if (ratio < 0.5) {
      labelOpacity = (ratio - 0.2) / 0.3;
    } else if (ratio < 3) {
      labelOpacity = 1;
    } else if (ratio < 5) {
      labelOpacity = 1 - (ratio - 3) / 2;
    } else {
      labelOpacity = 0;
    }
    labelRef.current.style.opacity = String(labelOpacity);
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner, outer, 128]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner, inner * 1.001, 128]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[outer * 0.999, outer, 128]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <Html
        position={[0, 0, -midRadius]}
        style={{ pointerEvents: "none", whiteSpace: "nowrap", userSelect: "none" }}
        center
        occlude={false}
      >
        <div
          ref={labelRef}
          style={{
            color: labelColor,
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            background: "rgba(10, 12, 20, 0.8)",
            padding: "2px 8px",
            borderRadius: "4px",
            border: `1px solid ${labelColor.replace(/[\d.]+\)$/, "0.3)")}`,
            letterSpacing: "0.05em",
            transition: "opacity 0.3s",
          }}
        >
          {label} ({innerAU}–{outerAU} AU)
        </div>
      </Html>
    </group>
  );
}

export function AsteroidBelt3D() {
  return (
    <BeltRing
      innerRadius={ASTEROID_BELT_INNER_KM}
      outerRadius={ASTEROID_BELT_OUTER_KM}
      color={new THREE.Color(160 / 255, 140 / 255, 100 / 255)}
      opacity={0.08}
      label="Asteroid Belt"
      labelColor="rgba(160, 140, 100, 0.5)"
    />
  );
}

export function KuiperBelt3D() {
  return (
    <BeltRing
      innerRadius={KUIPER_BELT_INNER_KM}
      outerRadius={KUIPER_BELT_OUTER_KM}
      color={new THREE.Color(100 / 255, 140 / 255, 180 / 255)}
      opacity={0.06}
      label="Kuiper Belt"
      labelColor="rgba(100, 140, 180, 0.45)"
    />
  );
}

export function OortCloud3D() {
  return (
    <BeltRing
      innerRadius={OORT_CLOUD_INNER_KM}
      outerRadius={OORT_CLOUD_OUTER_KM}
      color={new THREE.Color(80 / 255, 100 / 255, 140 / 255)}
      opacity={0.06}
      label="Oort Cloud"
      labelColor="rgba(80, 100, 140, 0.45)"
    />
  );
}

function PlanetaryRing({
  position,
  innerRadiusKm,
  outerRadiusKm,
  color,
  opacity,
}: {
  position: [number, number, number];
  innerRadiusKm: number;
  outerRadiusKm: number;
  color: THREE.Color;
  opacity: number;
}) {
  const inner = innerRadiusKm * KM_TO_SCENE;
  const outer = outerRadiusKm * KM_TO_SCENE;

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner, outer, 128]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[outer * 0.998, outer, 128]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function PlanetaryRings3D({ bodyStates3D }: { bodyStates3D: Map<string, BodyState3D> }) {
  const jupiterState = bodyStates3D.get("jupiter");
  const saturnState = bodyStates3D.get("saturn");

  return (
    <>
      {jupiterState && (
        <PlanetaryRing
          position={toThreePos(jupiterState.position)}
          innerRadiusKm={JUPITER_RING_INNER_KM}
          outerRadiusKm={JUPITER_RING_OUTER_KM}
          color={new THREE.Color(180 / 255, 160 / 255, 120 / 255)}
          opacity={0.15}
        />
      )}
      {saturnState && (
        <PlanetaryRing
          position={toThreePos(saturnState.position)}
          innerRadiusKm={SATURN_RING_INNER_KM}
          outerRadiusKm={SATURN_RING_OUTER_KM}
          color={new THREE.Color(210 / 255, 190 / 255, 140 / 255)}
          opacity={0.25}
        />
      )}
    </>
  );
}
