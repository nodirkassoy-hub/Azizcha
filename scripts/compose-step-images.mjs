/**
 * Composes stand-in images for production steps 04–06 from existing factory
 * photography (distinct crops + grading). Run: node scripts/compose-step-images.mjs
 * Replace the outputs with real photography when available (see ASSETS.md).
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/images/steps", { recursive: true });

const jobs = [
  {
    // 04 KESISH — cutting machine region of the hero factory hall.
    src: "public/media/hero-poster.jpg",
    out: "public/images/steps/04-kesish.jpg",
    extract: { left: 520, top: 260, width: 900, height: 562 },
    tint: { r: 220, g: 240, b: 255 },
  },
  {
    // 05 SIFAT NAZORATI — product close-up (cut face detail) as inspection visual.
    src: "public/images/products/oq.jpg",
    out: "public/images/steps/05-sifat.jpg",
    extract: { left: 180, top: 140, width: 860, height: 538 },
    tint: { r: 235, g: 245, b: 255 },
  },
  {
    // 06 TAYYOR MAHSULOT — finished block / line region of the factory shot.
    src: "public/images/about-factory.jpg",
    out: "public/images/steps/06-tayyor.jpg",
    extract: { left: 640, top: 300, width: 900, height: 562 },
    tint: { r: 250, g: 244, b: 232 },
  },
];

for (const job of jobs) {
  const meta = await sharp(job.src).metadata();
  const width = Math.min(job.extract.width, meta.width - job.extract.left);
  const height = Math.min(job.extract.height, meta.height - job.extract.top);
  await sharp(job.src)
    .extract({ ...job.extract, width, height })
    .resize(1280, 800, { fit: "cover" })
    .tint(job.tint)
    .jpeg({ quality: 88 })
    .toFile(job.out);
  console.log("wrote", job.out);
}
