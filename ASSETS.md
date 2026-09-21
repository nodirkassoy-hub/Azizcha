# ASSETS — media files & where to drop them

All paths are relative to `public/`. Never hotlink third-party stock media.
Only the **IZO PLUS** / **PENAPLAST ZAVODI** brand names may appear in assets,
metadata or filenames.

## Logo

| File | Purpose |
| --- | --- |
| `images/logo.svg` | Primary logo lockup (dark backgrounds): white "IZO" + cyan→blue gradient "PLUS", tagline **PENAPLAST ZAVODI** in small wide-tracked caps. |
| `images/logo-light.svg` | Light-theme variant (light backgrounds): dark navy "IZO" + gradient "PLUS". |
| `images/logo.png` | Optional PNG export of `logo.svg` (see export note below). |
| `images/logo-light.png` | Optional PNG export of `logo-light.svg`. |
| `app/icon.svg` | Browser/app icon (auto-used by Next.js). |

The wordmark is built from vector paths (font-independent). To rasterize PNGs:

```bash
npx --yes sharp-cli -i public/images/logo.svg -o public/images/logo.png
npx --yes sharp-cli -i public/images/logo-light.svg -o public/images/logo-light.png
```

> Note: if you have an official logo file, place it at `images/logo.svg` /
> `images/logo-light.svg` (keep the same filenames) — no code changes needed.

## Hero background

| File | Purpose | Status |
| --- | --- | --- |
| `media/hero-poster.jpg` | Cinematic factory still — hero poster + video fallback | ✅ generated placeholder (replace with real factory photography/video frames) |
| `media/hero-factory.mp4` | Hero background video, H.264 mp4 (desktop) | ⬜ **drop file here** |
| `media/hero-factory.webm` | Hero background video, VP9 webm (desktop) | ⬜ **drop file here** |
| `media/hero-factory-mobile.mp4` | Smaller mp4 for mobile (≤ 768px) | ⬜ **drop file here** |

Specs for the videos: 8–20 s loop, no audio, muted-friendly, 1920×1080 desktop
(≤ 8 MB), 1280×720 mobile (≤ 3 MB). While the video files are missing, the
poster is shown with a slow subtle scale animation (also used for
`prefers-reduced-motion`).

## Product photos

| File | Used in |
| --- | --- |
| `images/products/oq.jpg` | OQ PENAPLAST card, detail modal, search results |
| `images/products/qora.jpg` | QORA PENAPLAST card, detail modal, search results |
| `images/products/maydalangan.jpg` | MAYDALANGAN PENAPLAST card, detail modal, search results |

Any 4:3 or square studio photo works — replace these files to use real product
photography (keep filenames).

## 3D section

| File | Used in |
| --- | --- |
| `images/3d-fallback.jpg` | Static fallback when WebGL is unavailable |
| `images/beads-macro.jpg` | PENAPLAST DONALARI photo fallback + macro visual |

## Production steps (ISHLAB CHIQARISH)

| File | Step | Status |
| --- | --- | --- |
| `images/steps/01-xomashyo.jpg` | 01 XOMASHYO | ✅ generated placeholder |
| `images/steps/02-kopirtirish.jpg` | 02 KO‘PIRTIRISH | ✅ generated placeholder |
| `images/steps/03-qoliplash.jpg` | 03 QOLIPLASH | ✅ generated placeholder |
| `images/steps/04-kesish.jpg` | 04 KESISH | ⚠️ composed stand-in (crop of `media/hero-poster.jpg`) |
| `images/steps/05-sifat.jpg` | 05 SIFAT NAZORATI | ⚠️ composed stand-in (crop of `images/products/oq.jpg`) |
| `images/steps/06-tayyor.jpg` | 06 TAYYOR MAHSULOT | ⚠️ composed stand-in (crop of `images/about-factory.jpg`) |

Steps 04–06 are composed from the factory shots with `scripts/compose-step-images.mjs`
(distinct crops + grading). Replace them with dedicated real photography of wire
cutting, QC inspection and finished stacked product when available — same
filenames, no code changes needed.

## About

| File | Used in |
| --- | --- |
| `images/about-factory.jpg` | BIZ HAQIMIZDA split layout |

All current images are AI-generated placeholders with a consistent
"premium futuristic industrial" look — replace them with real factory
photography when available (same filenames, no code changes needed).
