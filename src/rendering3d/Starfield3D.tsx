import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Starfield3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const { geometry, material } = useMemo(() => {
    const count = 6000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Seeded random for consistency
    let seed = 42;
    const rng = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Star color palette (same distribution as 2D)
    const starColors: [number, number, number][] = [
      [0.75, 0.85, 1.0],   // blue-white
      [1.0, 0.95, 0.85],   // warm white
      [1.0, 0.82, 0.62],   // yellow
      [0.65, 0.75, 1.0],   // blue
      [1.0, 0.7, 0.5],     // orange
    ];

    for (let i = 0; i < count; i++) {
      // Distribute uniformly on a sphere shell
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const radius = 800 + rng() * 200; // shell between 800-1000

      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      positions[i * 3 + 2] = Math.cos(phi) * radius;

      const colorIdx = Math.floor(rng() * starColors.length);
      const c = starColors[colorIdx];
      const brightness = 0.5 + rng() * 0.5;
      colors[i * 3] = c[0] * brightness;
      colors[i * 3 + 1] = c[1] * brightness;
      colors[i * 3 + 2] = c[2] * brightness;

      sizes[i] = 1.0 + rng() * 2.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, []);

  // Follow the camera every frame so stars are always surrounding us
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} renderOrder={-1} />
    </group>
  );
}
