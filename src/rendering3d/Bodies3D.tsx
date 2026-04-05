import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSimStore } from "../store";
import type { BodyState3D } from "../core/types3d";
import type { CelestialBodyData } from "../core/types";
import { toThreePos, toThreeRadius, MIN_DISPLAY, MIN_REAL } from "./constants";

const PROBE_MODEL_IDS = ["voyager-1", "voyager-2", "pioneer-10", "pioneer-11", "new-horizons"] as const;

function cloneAndFixMaterials(scene: THREE.Object3D): THREE.Object3D {
  const cloned = scene.clone(true);
  cloned.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return;
    const mesh = node as THREE.Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const fixed = materials.map((m) => {
      const c = m.clone();
      if (c instanceof THREE.MeshStandardMaterial) {
        // Without an environment map, high metalness makes PBR surfaces black/grey.
        // Cap metalness and ensure roughness so the ambient + point light contribute.
        c.metalness = Math.min(c.metalness, 0.3);
        c.roughness = Math.max(c.roughness, 0.4);
        c.needsUpdate = true;
      }
      return c;
    });
    mesh.material = Array.isArray(mesh.material) ? fixed : fixed[0];
  });
  return cloned;
}

// ── Probe model components (hooks called unconditionally) ─────────────

function VoyagerModel({ radius }: { radius: number }) {
  const mainGltf = useGLTF("/voyager.glb");
  const antennaGltf = useGLTF("/voyager-antenna.glb");

  const { mainScene, antennaScene, scale } = useMemo(() => {
    const main = cloneAndFixMaterials(mainGltf.scene);
    const antenna = cloneAndFixMaterials(antennaGltf.scene);
    const box = new THREE.Box3().setFromObject(main);
    antenna.updateMatrixWorld(true);
    box.expandByObject(antenna);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return { mainScene: main, antennaScene: antenna, scale: (radius * 2) / maxDim };
  }, [mainGltf.scene, antennaGltf.scene, radius]);

  return (
    <group scale={[scale, scale, scale]}>
      <primitive object={mainScene} />
      <primitive object={antennaScene} />
    </group>
  );
}

function PioneerModel({ radius }: { radius: number }) {
  const gltf = useGLTF("/pioneer.glb");

  const { scene, scale } = useMemo(() => {
    const s = cloneAndFixMaterials(gltf.scene);
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return { scene: s, scale: (radius * 2) / maxDim };
  }, [gltf.scene, radius]);

  return (
    <group scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

function NewHorizonsModel({ radius }: { radius: number }) {
  const gltf = useGLTF("/new-horizons.glb");

  const { scene, scale } = useMemo(() => {
    const s = cloneAndFixMaterials(gltf.scene);
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return { scene: s, scale: (radius * 2) / maxDim };
  }, [gltf.scene, radius]);

  return (
    <group scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

function ProbeModel({ bodyId, radius }: { bodyId: string; radius: number }) {
  if (bodyId === "voyager-1" || bodyId === "voyager-2") {
    return <VoyagerModel radius={radius} />;
  }
  if (bodyId === "pioneer-10" || bodyId === "pioneer-11") {
    return <PioneerModel radius={radius} />;
  }
  if (bodyId === "new-horizons") {
    return <NewHorizonsModel radius={radius} />;
  }
  return null;
}

// ── Oriented probe wrapper ────────────────────────────────────────────

// Rotate probe model so +Y (antenna axis) faces Earth/Sun direction
const _antennaAxis = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _quat = new THREE.Quaternion();

function OrientedProbe({
  bodyId,
  radius,
  earthPos,
}: {
  bodyId: string;
  radius: number;
  earthPos: THREE.Vector3 | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Direction from probe (local origin inside its parent group) to Earth/Sun
    const target = earthPos ?? new THREE.Vector3(0, 0, 0);
    // Get probe world position
    const probeWorld = groupRef.current.parent!.getWorldPosition(new THREE.Vector3());
    _dir.copy(target).sub(probeWorld).normalize();

    if (_dir.lengthSq() > 0) {
      _quat.setFromUnitVectors(_antennaAxis, _dir);
      groupRef.current.quaternion.copy(_quat);
    }
  });

  return (
    <group ref={groupRef}>
      <ProbeModel bodyId={bodyId} radius={radius} />
    </group>
  );
}

// ── Body rendering ────────────────────────────────────────────────────

function getDisplayRadius(body: CelestialBodyData, humanEyeScale: boolean): number {
  const mins = humanEyeScale ? MIN_DISPLAY : MIN_REAL;
  const minR = mins[body.type as keyof typeof mins] ?? 0.02;
  return toThreeRadius(body.radius, minR);
}

function BodyMesh({
  body,
  state3d,
  isSelected,
  humanEyeScale,
  showIndicator,
  earthPos,
  showProbeModels,
}: {
  body: CelestialBodyData;
  state3d: BodyState3D;
  isSelected: boolean;
  humanEyeScale: boolean;
  showIndicator: boolean;
  earthPos: THREE.Vector3 | null;
  showProbeModels: boolean;
}) {
  const selectBody = useSimStore((s) => s.selectBody);
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = toThreePos(state3d.position);
  const radius = getDisplayRadius(body, humanEyeScale);
  const isStar = body.type === "star";
  const isProbe = body.type === "probe" || body.type === "comet";
  const hasModel = showProbeModels && isProbe && PROBE_MODEL_IDS.includes(body.id as typeof PROBE_MODEL_IDS[number]);

  return (
    <group position={pos}>
      {hasModel ? (
        <group
          onClick={(e) => {
            e.stopPropagation();
            selectBody(body.id);
          }}
        >
          <OrientedProbe bodyId={body.id} radius={radius} earthPos={earthPos} />
        </group>
      ) : (
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            selectBody(body.id);
          }}
        >
          {isProbe ? (
            <octahedronGeometry args={[radius, 0]} />
          ) : (
            <sphereGeometry args={[radius, isStar ? 32 : 16, isStar ? 32 : 16]} />
          )}
          {isStar ? (
            <meshBasicMaterial color={body.color} />
          ) : (
            <meshStandardMaterial color={body.color} roughness={0.7} metalness={0.1} />
          )}
        </mesh>
      )}

      {isStar && (
        <pointLight color={body.color} intensity={3} distance={0} decay={2} />
      )}

      {isSelected && showIndicator && (
        <mesh>
          <sphereGeometry args={[radius * 1.6, 24, 24]} />
          <meshBasicMaterial
            color="#4a9eff"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}
    </group>
  );
}

// Preload all probe models
useGLTF.preload("/voyager.glb");
useGLTF.preload("/voyager-antenna.glb");
useGLTF.preload("/pioneer.glb");
useGLTF.preload("/new-horizons.glb");

export function Bodies3D({ bodyStates3D, showProbeModels }: { bodyStates3D: Map<string, BodyState3D>; showProbeModels: boolean }) {
  const activeBodies = useSimStore((s) => s.activeBodies);
  const selectedBodyId = useSimStore((s) => s.selectedBodyId);
  const humanEyeScale = useSimStore((s) => s.humanEyeScale);
  const showSelectionIndicator = useSimStore((s) => s.showSelectionIndicator);

  // Get Earth position for probe antenna orientation (fall back to Sun = origin)
  const earthState = bodyStates3D.get("earth");
  const earthPos = useMemo(() => {
    if (!earthState) return null;
    const [x, y, z] = toThreePos(earthState.position);
    return new THREE.Vector3(x, y, z);
  }, [earthState?.position.x, earthState?.position.y, earthState?.position.z]);

  return (
    <>
      {activeBodies.map((body) => {
        const state3d = bodyStates3D.get(body.id);
        if (!state3d) return null;
        return (
          <BodyMesh
            key={body.id}
            body={body}
            state3d={state3d}
            isSelected={body.id === selectedBodyId}
            humanEyeScale={humanEyeScale}
            showIndicator={showSelectionIndicator}
            earthPos={earthPos}
            showProbeModels={showProbeModels}
          />
        );
      })}
    </>
  );
}
