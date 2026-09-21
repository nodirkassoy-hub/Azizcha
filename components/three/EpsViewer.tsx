"use client";

/**
 * Main 3D EPS viewer (react-three-fiber).
 *
 * - Realistic foam material (procedural bead texture, sheen, bump, LOD detail)
 * - Product switch: OQ block / QORA block / MAYDALANGAN pile
 * - Thickness control scales block thickness (illustrative)
 * - Density subtly tightens the bead texture
 * - Damped orbit, wheel-zoom only while hovering (desktop),
 *   "Tap to interact" activation on touch (page scroll never trapped)
 * - Studio lighting + soft contact shadow on a subtle dark glass floor
 */

import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ProductDef } from "@/config/products";
import { createBeadGeometry, createEpsMaterial, getBeadMaps } from "./beadTexture";

export interface CameraApi {
  zoomBy: (factor: number) => void;
  reset: () => void;
}

export interface EpsViewerProps {
  mode: ProductDef["viewer"];
  thicknessCm: number;
  density: number;
  autoRotate: boolean;
  paused: boolean;
  interactive: boolean;
  onInteract?: () => void;
  apiRef: React.MutableRefObject<CameraApi | null>;
}

const BASE_CAMERA = new THREE.Vector3(3.1, 1.7, 4.3);
const MIN_DIST = 2.3;
const MAX_DIST = 7.6;

function detailFromDistance(distance: number): number {
  // Full macro detail when close, fades out when zoomed away.
  return THREE.MathUtils.clamp(1 - (distance - MIN_DIST) / 2.3, 0, 1);
}

function CameraRig({
  apiRef,
  thicknessCm,
  density,
  mode,
  autoRotate,
}: Pick<EpsViewerProps, "apiRef" | "thicknessCm" | "density" | "mode" | "autoRotate">) {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const detailUniform = useMemo(() => ({ value: 0 }), []);
  const material = useMemo(
    () => createEpsMaterial(mode === "block-black" ? "black" : "white", detailUniform),
    [mode, detailUniform],
  );

  // Density subtly affects bead tightness (texture scale).
  useEffect(() => {
    const repeat = 1.9 + ((density - 7) / 13) * 0.8;
    const maps = getBeadMaps(mode === "block-black" ? "black" : "white");
    // Clone-safe: adjust shared maps (same density for the whole session).
    maps.map.repeat.set(repeat, repeat * 0.8);
    maps.bumpMap.repeat.set(repeat, repeat * 0.8);
    maps.map.needsUpdate = true;
    maps.bumpMap.needsUpdate = true;
  }, [density, mode]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  // Imperative zoom / reset API for on-screen buttons.
  useEffect(() => {
    apiRef.current = {
      zoomBy: (factor: number) => {
        const controls = controlsRef.current;
        if (!controls) return;
        const target = controls.target as THREE.Vector3;
        const offset = camera.position.clone().sub(target);
        const next = THREE.MathUtils.clamp(offset.length() * factor, MIN_DIST, MAX_DIST);
        offset.setLength(next);
        camera.position.copy(target.clone().add(offset));
      },
      reset: () => {
        camera.position.copy(BASE_CAMERA);
        const controls = controlsRef.current;
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
      },
    };
  }, [apiRef, camera]);

  useFrame(() => {
    // LOD: blend the high-frequency bead layer as the camera closes in.
    const distance = camera.position.length();
    detailUniform.value = detailFromDistance(distance);
  });

  const blockHeight = 0.22 + (thicknessCm / 60) * 1.55;

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={MIN_DIST}
        maxDistance={MAX_DIST}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI * 0.55}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
      />

      {mode === "granules" ? (
        <GranulePile material={material} />
      ) : (
        <RoundedBox
          args={[3.0, 1, 1.45]}
          radius={0.07}
          smoothness={4}
          scale={[1.02, blockHeight, 0.99]}
          rotation={[0.015, 0.42, -0.01]}
          castShadow
          receiveShadow
          material={material}
        />
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]} receiveShadow>
        <circleGeometry args={[5.2, 48]} />
        <meshPhysicalMaterial color="#060d18" roughness={0.35} metalness={0.55} clearcoat={0.5} clearcoatRoughness={0.4} />
      </mesh>
      <ContactShadows position={[0, -0.7, 0]} opacity={0.6} scale={9} blur={2.6} far={3.2} resolution={512} color="#01040a" />
    </>
  );
}

/** Pile of crushed EPS granules. */
function GranulePile({ material }: { material: THREE.Material }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 420;
  const geometry = useMemo(() => createBeadGeometry(0.16), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const rand = mulberry(41);
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand()) * 1.25;
      const mound = Math.max(0, 0.55 * (1 - radius / 1.35));
      const scale = 0.1 + rand() * 0.12;
      dummy.position.set(Math.cos(angle) * radius, -0.55 + rand() * mound + scale * 0.4, Math.sin(angle) * radius * 0.75);
      dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      dummy.scale.setScalar(scale * (0.85 + rand() * 0.4));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const tone = 0.86 + rand() * 0.14;
      color.setRGB(tone, tone * 0.99, tone * 0.95);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} castShadow receiveShadow frustumCulled={false} />
  );
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

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      {/* large soft key */}
      <directionalLight
        position={[4.5, 6.5, 3.5]}
        intensity={1.45}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0005}
      />
      {/* cool fill */}
      <directionalLight position={[-5, 3.5, -2]} intensity={0.5} color="#9fd8ff" />
      {/* rim */}
      <directionalLight position={[-1, 2.5, -6]} intensity={0.65} color="#bfe9ff" />
    </>
  );
}

export default function EpsViewer(props: EpsViewerProps) {
  const { mode, thicknessCm, density, autoRotate, paused, interactive, apiRef, onInteract } = props;

  return (
    <div
      className="h-full w-full"
      style={{ touchAction: interactive ? "none" : "pan-y" }}
      onPointerDown={() => onInteract?.()}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: BASE_CAMERA.toArray(), fov: 34, near: 0.1, far: 40 }}
        frameloop={paused ? "never" : "always"}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <StudioLights />
        <CameraRig
          apiRef={apiRef}
          thicknessCm={thicknessCm}
          density={density}
          mode={mode}
          autoRotate={autoRotate}
        />
      </Canvas>
    </div>
  );
}
