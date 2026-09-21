"use client";

/**
 * PENAPLAST DONALARI — macro WebGL scene: thousands of fused EPS beads
 * (InstancedMesh of noise-displaced, slightly squashed spheres with random
 * scale, rotation and tone). Slider-driven "zoom from block to bead".
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createBeadGeometry } from "./beadTexture";

export interface BeadsViewerProps {
  /** 0 = whole block-like cluster, 1 = macro bead close-up. */
  zoom: number;
  autoRotate: boolean;
  paused: boolean;
  interactive: boolean;
  onInteract?: () => void;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function BeadCloud({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createBeadGeometry(0.1), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const rand = mulberry(7);

    // Block-shaped cluster of beads on a jittered grid (fused look).
    const spacing = 0.155;
    const nx = 22;
    const ny = 8;
    const nz = 11;
    let i = 0;
    for (let gy = 0; gy < ny && i < count; gy++) {
      for (let gz = 0; gz < nz && i < count; gz++) {
        for (let gx = 0; gx < nx && i < count; gx++) {
          const jx = (rand() - 0.5) * spacing * 0.55;
          const jy = (rand() - 0.5) * spacing * 0.55;
          const jz = (rand() - 0.5) * spacing * 0.55;
          dummy.position.set(
            (gx - nx / 2) * spacing + jx,
            (gy - ny / 2) * spacing * 0.92 + jy,
            (gz - nz / 2) * spacing + jz,
          );
          dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
          const s = 0.15 + rand() * 0.05;
          dummy.scale.set(s, s * (0.82 + rand() * 0.1), s);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          const tone = 0.82 + rand() * 0.18;
          color.setRGB(tone, tone * 0.985, tone * 0.94);
          mesh.setColorAt(i, color);
          i++;
        }
      }
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f4efe2",
        roughness: 0.92,
        metalness: 0,
        vertexColors: true,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} castShadow receiveShadow frustumCulled={false} />
  );
}

function CameraZoom({ zoom }: { zoom: number }) {
  const { camera } = useThree();
  useFrame(() => {
    // Slider-driven zoom from block (far) to bead (macro close-up).
    const targetZ = THREE.MathUtils.lerp(5.6, 0.62, zoom);
    const dir = camera.position.clone().normalize();
    const desired = dir.multiplyScalar(targetZ);
    camera.position.lerp(desired, 0.08);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function AutoSpin({ active, children }: { active: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (active && ref.current) ref.current.rotation.y += delta * 0.12;
  });
  return <group ref={ref}>{children}</group>;
}

export default function BeadsViewer({ zoom, autoRotate, paused, interactive, onInteract }: BeadsViewerProps) {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
  const count = isMobile ? 1200 : 3000;

  return (
    <div
      className="h-full w-full"
      style={{ touchAction: interactive ? "none" : "pan-y" }}
      onPointerDown={() => onInteract?.()}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [3.4, 2.2, 3.4], fov: 32, near: 0.05, far: 40 }}
        frameloop={paused ? "never" : "always"}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[3, 5, 2.5]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-4, 2, -2]} intensity={0.45} color="#a8dcff" />
        <directionalLight position={[0, 1.5, -5]} intensity={0.55} color="#c7ecff" />
        <AutoSpin active={autoRotate}>
          <BeadCloud count={count} />
        </AutoSpin>
        <CameraZoom zoom={zoom} />
        {/* soft depth cue */}
        <fog attach="fog" args={["#0a1626", 3.2, 8.5]} />
      </Canvas>
    </div>
  );
}
