# IZO PLUS — PENAPLAST ZAVODI

Premium, futuristic-industrial single-page website for **IZO PLUS**, an EPS
(expanded polystyrene / penaplast) factory in Uzbekistan.

**Funnel:** PRODUCT → INFORMATION → 3D → PRICE → ORDER → TELEGRAM

Built with Next.js (App Router) + TypeScript + Tailwind CSS + Three.js
(react-three-fiber) + Framer Motion + zod. Deployable on Vercel.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Telegram values
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Environment variables (server-only)

| Variable | Description |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather. **Server-only** — never `NEXT_PUBLIC_`, never sent to the browser, never logged. |
| `TELEGRAM_CHAT_ID` | Numeric chat id (e.g. `-1001234567890`) or `@channelusername`. |

Orders are delivered via `POST /api/order` → Telegram Bot API `sendMessage`.
The route **recomputes all prices server-side** (client-sent prices are
ignored) and reports success **only** when Telegram accepted the message.

## Structure

```
app/                  App Router: layout, page, /api/order route, global styles
components/
  layout/             Navbar, drawer, search overlay, footer, mobile action bar…
  sections/           Hero, Mahsulotlar, 3D Tajriba, Ishlab chiqarish…
  products/           Product cards, variant result cards, toolbar, detail modal
  three/              WebGL viewers (EPS block, bead macro, fallback)
  order/              Order modal + live summary
  ui/                 Logo, icons, modal, chips, stepper…
config/
  site.ts             Contacts, prices (USD), density/thickness tables, switches
  products.ts         Product structure + search synonyms
content/
  uz.ts ru.ts en.ts   ALL editable copy (UZ default, RU, EN)
lib/                  Shared pure pricing, search engine, validation (zod), i18n…
public/
  media/ images/      All media (see ASSETS.md)
```

## Editable configuration

- **Prices** — `config/site.ts` → `DENSITY_PRICES_USD` (kg/m³ → USD),
  `CRUSHED_PRICE_USD_PER_KG` ($0.70 / KG), `PRICE_UNIT_LABEL_BLOCKS`,
  `SHOW_ORDER_TOTAL` (turn "Taxminiy jami" on/off).
- **Thickness options** — `THICKNESS_CM` (max 60 cm — never add > 60).
- **Contacts** — `CONTACT` (phone, Telegram), `CONTACT_OPTIONAL` (address /
  email — leave empty to hide).
- **About extra** — `ABOUT_EXTRA` (empty by default; add verified facts only).
- **Copy** — `content/uz.ts`, `content/ru.ts`, `content/en.ts`.

Price computation lives in one pure module (`lib/pricing.ts`) used by **both**
client and server.

## Search

Real, functional search in the products toolbar and the navbar overlay:
name + multilingual synonyms (oq/белый/white…), apostrophe-insensitive,
numeric parsing (`15 kg` → density, `10 sm` → thickness, `$67` → price,
`0.7`/`70` → crushed per-kg price), debounced 150 ms, keyboard navigable,
highlighted matches, combined with type/density/thickness filters.

## Order flow

Every **BUYURTMA BERISH** button opens one glass modal (bottom-sheet on
mobile) with inline validation (UZ/RU/EN), live summary
("Taxminiy jami" + "Yakuniy narx menejer bilan tasdiqlanadi."),
states `idle → sending → success → error`.

- Success **only** after Telegram accepted the message.
- On failure the form data is kept and the user gets "Qayta yuborish"
  and "Telegram orqali yozish" fallbacks — the order is never claimed sent.

## 3D

- EPS block viewer (react-three-fiber): procedural Voronoi bead texture
  (canvas), matte foam material with sheen + bump + zoom-driven macro detail
  (LOD), OQ / QORA / MAYDALANGAN modes, thickness slider (illustrative),
  damped orbit, contact shadow, touch activation overlay ("Tegib boshqaring")
  so page scroll is never trapped.
- **PENAPLAST DONALARI**: InstancedMesh macro of thousands of fused beads with
  a slider-driven zoom from block to bead.
- Lazy-loaded near the viewport, paused off-screen, DPR capped (2 / 1.5
  mobile), static image fallback when WebGL is missing.

## Media

See [ASSETS.md](./ASSETS.md) — which files to drop where (hero video, logo
exports, real factory photography). All current images are consistent
AI-generated placeholders with a premium industrial look.

## Deploy (Vercel)

1. Push the repo and import it in Vercel.
2. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in Project → Settings →
   Environment Variables.
3. Deploy. No extra configuration needed.
