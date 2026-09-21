/**
 * Procedural EPS bead texture maps (canvas-based Worley/Voronoi cells).
 *
 * Generates:
 *  - map       : fused bead color map (warm off-white / graphite, dark fused
 *                boundaries, tiny voids, per-bead tone variation)
 *  - bumpMap   : matching bead height map
 *  - detailMap : higher-frequency detail layer for LOD blending at max zoom
 *
 * The pattern is toroidal (wraps seamlessly) and blended at two scales in the
 * material shader to avoid visible tiling.
 */

import * as THREE from "three";

export type BeadPalette = "white" | "black";

export interface BeadMaps {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  detailMap: THREE.CanvasTexture;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Feature {
  x: number;
  y: number;
  tone: number;
  isVoid: boolean;
}

interface CellField {
  features: Feature[];
  cells: number;
}

function buildField(cells: number, seed: number, voidRatio: number): CellField {
  const rand = mulberry32(seed);
  const features: Feature[] = [];
  for (let gy = 0; gy < cells; gy++) {
    for (let gx = 0; gx < cells; gx++) {
      features.push({
        x: (gx + 0.2 + rand() * 0.6) / cells,
        y: (gy + 0.2 + rand() * 0.6) / cells,
        tone: rand(),
        isVoid: rand() < voidRatio,
      });
    }
  }
  return { features, cells };
}

function wrapDelta(a: number, b: number): number {
  let d = a - b;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

interface Sample {
  f1: number;
  f2: number;
  feature: Feature;
}

function sampleField(field: CellField, x: number, y: number): Sample {
  const { features, cells } = field;
  const gx = Math.floor(x * cells);
  const gy = Math.floor(y * cells);
  let f1 = 2;
  let f2 = 2;
  let best = features[0];
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = ((gx + ox) % cells + cells) % cells;
      const cy = ((gy + oy) % cells + cells) % cells;
      const feature = features[cy * cells + cx];
      const dx = wrapDelta(x, feature.x);
      const dy = wrapDelta(y, feature.y);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < f1) {
        f2 = f1;
        f1 = dist;
        best = feature;
      } else if (dist < f2) {
        f2 = dist;
      }
    }
  }
  return { f1, f2, feature: best };
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function canvasFromSize(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; image: ImageData } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx, image: ctx.createImageData(size, size) };
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function generateBeadMaps(palette: BeadPalette, seed = 7): BeadMaps {
  const size = 512;
  const cells = palette === "white" ? 14 : 15;
  const voidRatio = palette === "white" ? 0.05 : 0.04;
  const field = buildField(cells, seed, voidRatio);

  const color = canvasFromSize(size);
  const height = canvasFromSize(size);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = px / size;
      const y = py / size;
      const { f1, f2, feature } = sampleField(field, x, y);

      // Fused boundary: narrow dark seam between beads.
      const edge = f2 - f1;
      const border = 1 - smoothstep(0.0, 0.085, edge);
      // Bead dome height with a dip at the seams.
      const dome = smoothstep(0.42, 0.0, f1);
      let h = dome * (1 - border * 0.85);

      // Tiny voids / gaps.
      if (feature.isVoid) {
        h *= 0.35;
      }

      // Micro imperfections.
      const micro = (mulberry32(px * 374761 + py * 668265 + seed)() - 0.5) * 0.06;
      h = Math.min(1, Math.max(0, h + micro));

      const i = (py * size + px) * 4;
      height.image.data[i] = h * 255;
      height.image.data[i + 1] = h * 255;
      height.image.data[i + 2] = h * 255;
      height.image.data[i + 3] = 255;

      // Color: per-bead warm tone variation, darker seams, void shadows.
      const tone = feature.tone;
      let r: number;
      let g: number;
      let b: number;
      if (palette === "white") {
        // Slightly warm off-white — never pure #fff.
        r = 240 + tone * 12;
        g = 236 + tone * 10;
        b = 222 + tone * 14;
        const seam = border * (feature.isVoid ? 120 : 88);
        r = r - seam - (feature.isVoid ? 30 : 0);
        g = g - seam * 1.02 - (feature.isVoid ? 30 : 0);
        b = b - seam * 0.95 - (feature.isVoid ? 26 : 0);
      } else {
        // Graphite EPS: dark grey beads with a subtle cool sparkle.
        const base = 40 + tone * 22;
        r = base;
        g = base + 2;
        b = base + 8;
        const seam = border * (feature.isVoid ? 30 : 22);
        r -= seam;
        g -= seam;
        b -= seam * 0.9;
        if (tone > 0.93) {
          r += 26;
          g += 28;
          b += 34;
        }
      }
      color.image.data[i] = Math.max(0, Math.min(255, r));
      color.image.data[i + 1] = Math.max(0, Math.min(255, g));
      color.image.data[i + 2] = Math.max(0, Math.min(255, b));
      color.image.data[i + 3] = 255;
    }
  }

  color.ctx.putImageData(color.image, 0, 0);
  height.ctx.putImageData(height.image, 0, 0);

  // High-frequency detail layer for LOD at max zoom (macro bead surface).
  const detailField = buildField(cells * 2 + 3, seed + 31, 0.03);
  const detail = canvasFromSize(size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const { f1, f2, feature } = sampleField(detailField, px / size, py / size);
      const edge = f2 - f1;
      const border = 1 - smoothstep(0.0, 0.07, edge);
      const dome = smoothstep(0.38, 0.0, f1);
      let h = dome * (1 - border * 0.9);
      if (feature.isVoid) h *= 0.3;
      h += (mulberry32(px * 1103515 + py * 12345 + seed)() - 0.5) * 0.08;
      h = Math.min(1, Math.max(0, h));
      const i = (py * size + px) * 4;
      detail.image.data[i] = h * 255;
      detail.image.data[i + 1] = h * 255;
      detail.image.data[i + 2] = h * 255;
      detail.image.data[i + 3] = 255;
    }
  }
  detail.ctx.putImageData(detail.image, 0, 0);

  return {
    map: toTexture(color.canvas, true),
    bumpMap: toTexture(height.canvas, false),
    detailMap: toTexture(detail.canvas, false),
  };
}

const cache = new Map<string, BeadMaps>();

export function getBeadMaps(palette: BeadPalette): BeadMaps {
  const key = palette;
  let maps = cache.get(key);
  if (!maps) {
    maps = generateBeadMaps(palette, palette === "white" ? 7 : 13);
    cache.set(key, maps);
  }
  return maps;
}

/**
 * EPS material: matte foam (metalness 0, roughness ~0.95), soft sheen
 * (light scatters gently through EPS), bead bump, and a zoom-driven
 * high-frequency detail layer blended in the shader (LOD).
 */
export function createEpsMaterial(palette: BeadPalette, detailUniform: { value: number }): THREE.MeshPhysicalMaterial {
  const maps = getBeadMaps(palette);
  const material = new THREE.MeshPhysicalMaterial({
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: palette === "white" ? 1.1 : 0.9,
    roughness: 0.95,
    metalness: 0,
    sheen: 0.55,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color(palette === "white" ? "#fff0d8" : "#93a7be"),
  });

  const detailMap = maps.detailMap;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDetail = detailUniform;
    shader.uniforms.uDetailMap = { value: detailMap };
    shader.uniforms.uDetailScale = { value: 3.4 };

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uDetail;
        uniform sampler2D uDetailMap;
        uniform float uDetailScale;`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          #ifdef USE_MAP
          vec2 dBuv = vMapUv * uDetailScale;
          float h0 = texture2D(uDetailMap, dBuv).r;
          float hX = texture2D(uDetailMap, dBuv + vec2(0.0035, 0.0)).r - h0;
          float hY = texture2D(uDetailMap, dBuv + vec2(0.0, 0.0035)).r - h0;
          vec3 detailPerturb = vec3(-hX, -hY, 0.0) * uDetail * 9.0;
          normal = normalize(normal + (viewMatrix * vec4(detailPerturb, 0.0)).xyz);
          diffuseColor.rgb *= mix(1.0, 0.72 + 0.5 * h0, uDetail);
          roughnessFactor = clamp(mix(roughnessFactor, roughnessFactor + (0.55 - h0) * 0.35, uDetail), 0.05, 1.0);
          #endif
        }`,
      );
  };
  material.customProgramCacheKey = () => `eps-foam-${palette}`;
  return material;
}

/** Noise-displaced, slightly squashed bead geometry (shared by piles & macro). */
export function createBeadGeometry(amplitude = 0.07): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(0.5, 14, 10);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const rand = mulberry32(99);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const n = 1 + (rand() - 0.5) * 2 * amplitude;
    position.setXYZ(i, x * n, y * n * 0.86, z * n);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
