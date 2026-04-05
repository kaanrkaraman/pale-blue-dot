import { useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSimStore } from "../store";
import { computeAllPositions3D } from "../core/simulation3d";
import type { BodyState3D } from "../core/types3d";
import { Bodies3D } from "./Bodies3D";
import { OrbitLines3D } from "./OrbitLines3D";
import { Labels3D } from "./Labels3D";
import { Starfield3D } from "./Starfield3D";
import { EclipticGrid } from "./EclipticGrid";
import { Heliosphere3D } from "./Heliosphere3D";
import { AsteroidBelt3D, KuiperBelt3D, OortCloud3D, PlanetaryRings3D } from "./Belts3D";
import { CameraController } from "./CameraController";

function SceneContent() {
  const [bodyStates3D, setBodyStates3D] = useState<Map<string, BodyState3D>>(new Map());
  const tick = useSimStore((s) => s.tick);
  const showHeliosphere = useSimStore((s) => s.showHeliosphere);
  const showAsteroidBelt = useSimStore((s) => s.showAsteroidBelt);
  const showKuiperBelt = useSimStore((s) => s.showKuiperBelt);
  const showOortCloud = useSimStore((s) => s.showOortCloud);
  const showEclipticPlane = useSimStore((s) => s.showEclipticPlane);
  const showProbeModels = useSimStore((s) => s.showProbeModels);

  useFrame((_, delta) => {
    const dtSec = Math.min(delta, 0.1);
    tick(dtSec);

    const state = useSimStore.getState();
    const newStates = computeAllPositions3D(
      state.simTime,
      state.activeBodies,
      state.system.centerBodyId,
    );
    setBodyStates3D(newStates);
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <Starfield3D />
      {showEclipticPlane && <EclipticGrid />}
      {showAsteroidBelt && <AsteroidBelt3D />}
      {showKuiperBelt && <KuiperBelt3D />}
      {showOortCloud && <OortCloud3D />}
      {showHeliosphere && <Heliosphere3D />}
      <PlanetaryRings3D bodyStates3D={bodyStates3D} />
      <Bodies3D bodyStates3D={bodyStates3D} showProbeModels={showProbeModels} />
      <OrbitLines3D bodyStates3D={bodyStates3D} />
      <Labels3D bodyStates3D={bodyStates3D} />
      <CameraController bodyStates3D={bodyStates3D} />
    </>
  );
}

export function Scene3D() {
  return (
    <Canvas
      camera={{
        position: [0, 800, 800],
        fov: 50,
        near: 0.001,
        far: 20_000_000,
      }}
      style={{ width: "100%", height: "100%", background: "#050510" }}
      gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}
    >
      <SceneContent />
    </Canvas>
  );
}
