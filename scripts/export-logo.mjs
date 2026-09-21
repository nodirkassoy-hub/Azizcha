/**
 * Rasterize logo SVGs to PNG (used once to produce public/images/logo*.png).
 * Run: node scripts/export-logo.mjs
 */
import sharp from "sharp";

for (const variant of ["logo", "logo-light"]) {
  await sharp(`public/images/${variant}.svg`, { density: 300 })
    .resize({ height: 512 })
    .png()
    .toFile(`public/images/${variant}.png`);
  console.log(`wrote public/images/${variant}.png`);
}
