/**
 * Product search engine — pure, used by client UI (toolbar + navbar overlay).
 *
 * Matching rules:
 *  - case-insensitive, apostrophe-insensitive (o‘ / o' / o` / ʻ are equal)
 *  - multilingual synonyms (oq/белый/white, qora/чёрный/black, maydalangan/дроблёный/crushed/granula)
 *  - numeric parsing:
 *      "15"        → density 15 OR thickness 15
 *      "15 kg"     → density 15          "10 cm/sm/см" → thickness 10
 *      "0.7"/"70"  → crushed price       "$67"          → unit price 67
 */

import { PRODUCTS, type ProductDef, type ProductId } from "@/config/products";
import { DENSITY_PRICES_USD, DENSITY_VALUES, THICKNESS_CM } from "@/config/site";
import { normalizeLoose, normalizeText } from "./normalize";
import {
  formatDensity,
  formatThickness,
  formatUnitPrice,
  getUnitPriceUsd,
  type DensityValue,
  type ThicknessValue,
} from "./pricing";

export interface Variant {
  productId: ProductId;
  density: DensityValue | null;
  thickness: ThicknessValue | null;
  /** Fields that matched the query — for highlight rendering. */
  matched: {
    name: boolean;
    density: boolean;
    thickness: boolean;
    price: boolean;
  };
}

export interface ParsedQuery {
  raw: string;
  words: string[];
  /** Numbers bound to a density unit (kg/m3…). */
  densityNums: number[];
  /** Numbers bound to a thickness unit (cm/sm/см). */
  thicknessNums: number[];
  /** Numbers bound to money ($, usd) or crushed price hints. */
  priceNums: number[];
  /** Bare numbers without unit hints. */
  bareNums: number[];
  /** Whether the query contains explicit density/thickness unit hints. */
  hasDensityHint: boolean;
  hasThicknessHint: boolean;
  isEmpty: boolean;
}

const DENSITY_UNIT = /(kg|m3|m³|кг|plotnost|плотность)/i;
const THICKNESS_UNIT = /(cm|sm|см|qalin|толщ|thickness)/i;
const PRICE_UNIT = /(\$|usd|dollar|narx|цен|price|so'm|сум)/i;

export function parseQuery(input: string): ParsedQuery {
  const raw = input.trim();
  // Merge "15 kg", "10 cm", "10 sm", "5 кг/м³"… into single tokens so units
  // bind to their number across whitespace.
  const merged = raw.replace(
    /(\d+(?:[.,]\d+)?)\s*(kg\s*\/\s*m[³3]?|kg|m3|кг|cm|sm|см|mm|мм)/gi,
    "$1$2",
  );
  const tokens = merged.split(/[\s,;]+/).filter(Boolean);
  const words: string[] = [];
  const densityNums: number[] = [];
  const thicknessNums: number[] = [];
  const priceNums: number[] = [];
  const bareNums: number[] = [];
  let hasDensityHint = false;
  let hasThicknessHint = false;

  for (const token of tokens) {
    const numMatch = token.replace(",", ".").match(/\d+(?:\.\d+)?/);
    const hasDensity = DENSITY_UNIT.test(token);
    const hasThickness = THICKNESS_UNIT.test(token);
    const hasPrice = PRICE_UNIT.test(token);
    if (hasDensity) hasDensityHint = true;
    if (hasThickness) hasThicknessHint = true;

    if (numMatch) {
      const num = Number(numMatch[0]);
      if (hasPrice) priceNums.push(num);
      else if (hasDensity && !hasThickness) densityNums.push(num);
      else if (hasThickness && !hasDensity) thicknessNums.push(num);
      else bareNums.push(num);
    }
    // Keep non-numeric word part as a text term (e.g. "kg/m³" alone).
    const word = token.replace(/[\d.,]+/g, "").trim();
    if (word.length > 0) words.push(word);
    else if (!numMatch) words.push(token);
  }

  return {
    raw,
    words,
    densityNums,
    thicknessNums,
    priceNums,
    bareNums,
    hasDensityHint,
    hasThicknessHint,
    isEmpty: raw.length === 0,
  };
}

function productMatchesText(product: ProductDef, q: ParsedQuery): boolean {
  const terms = [product.id, ...product.synonyms].map(normalizeLoose);
  const haystack = terms.join(" | ");
  // Every word (or loose word) must be found in the name/synonyms.
  return q.words.every((w) => {
    const word = normalizeLoose(w);
    if (!word) return true;
    // Unit-only words (kg, cm…) don't constrain the name.
    if (DENSITY_UNIT.test(word) || THICKNESS_UNIT.test(word) || PRICE_UNIT.test(word)) return true;
    return haystack.includes(word);
  });
}

function variantMatchesNums(productId: ProductId, density: DensityValue | null, thickness: ThicknessValue | null, q: ParsedQuery) {
  const price = getUnitPriceUsd(productId, density);
  const matched = { name: false, density: false, thickness: false, price: false };

  // Explicit density numbers
  if (q.densityNums.length > 0) {
    if (density != null && q.densityNums.includes(density)) matched.density = true;
    else return null;
  }
  // Explicit thickness numbers
  if (q.thicknessNums.length > 0) {
    if (thickness != null && q.thicknessNums.includes(thickness)) matched.thickness = true;
    else return null;
  }
  // Explicit price numbers ("$67", "usd 87")
  if (q.priceNums.length > 0) {
    const hit = q.priceNums.some((n) => Math.abs(price - n) < 0.001 || Math.abs(price - n * 0.01) < 0.001);
    if (hit) matched.price = true;
    else return null;
  }
  // Bare numbers: match density OR thickness OR unit price OR crushed price (0.7 / 70 cents)
  if (q.bareNums.length > 0) {
    const hit = q.bareNums.some((n) => {
      const hitDensity = density != null && n === density;
      const hitThickness = thickness != null && n === thickness;
      const hitPrice = Math.abs(price - n) < 0.001 || Math.abs(price - n * 0.01) < 0.001;
      if (hitDensity) matched.density = true;
      if (hitThickness) matched.thickness = true;
      if (hitPrice) matched.price = true;
      return hitDensity || hitThickness || hitPrice;
    });
    if (!hit) return null;
  }
  return matched;
}

/** Expand products into concrete variants (product × density × thickness). */
export function expandVariants(products: ProductDef[] = PRODUCTS): Variant[] {
  const out: Variant[] = [];
  for (const product of products) {
    if (!product.hasDensity && !product.hasThickness) {
      out.push({
        productId: product.id,
        density: null,
        thickness: null,
        matched: { name: true, density: false, thickness: false, price: true },
      });
      continue;
    }
    for (const density of DENSITY_VALUES) {
      for (const thickness of THICKNESS_CM) {
        out.push({
          productId: product.id,
          density,
          thickness,
          matched: { name: false, density: false, thickness: false, price: false },
        });
      }
    }
  }
  return out;
}

export interface SearchFilters {
  type: ProductId | "all";
  density: DensityValue | "all";
  thickness: ThicknessValue | "all";
}

export interface SearchResult {
  variants: Variant[];
  /** Crushed excluded because a density/thickness filter is active. */
  crushedExcluded: boolean;
  isResultsMode: boolean;
}

/** Full search: query + filters combined. */
export function searchVariants(query: string, filters: SearchFilters): SearchResult {
  const q = parseQuery(query);
  const { type, density: densityFilter, thickness: thicknessFilter } = filters;
  const isResultsMode =
    !q.isEmpty || densityFilter !== "all" || thicknessFilter !== "all";

  const densityFilterActive = densityFilter !== "all";
  const thicknessFilterActive = thicknessFilter !== "all";
  const crushedExcluded = densityFilterActive || thicknessFilterActive || q.hasDensityHint || q.hasThicknessHint;

  let products = PRODUCTS;
  if (type !== "all") products = products.filter((p) => p.id === type);

  const variants: Variant[] = [];

  if (!isResultsMode) {
    // Default view: one entry per product (cards handle their own selectors).
    for (const product of products) {
      variants.push({
        productId: product.id,
        density: product.hasDensity ? DENSITY_VALUES[4] ?? DENSITY_VALUES[0] : null,
        thickness: product.hasThickness ? THICKNESS_CM[4] : null,
        matched: { name: true, density: false, thickness: false, price: true },
      });
    }
    return { variants, crushedExcluded: false, isResultsMode: false };
  }

  for (const product of products) {
    // Crushed rules.
    if (!product.hasDensity && !product.hasThickness) {
      if (crushedExcluded) continue;
      const nameHit = productMatchesText(product, q);
      const numHit = variantMatchesNums(product.id, null, null, q);
      const priceHintHit =
        q.bareNums.some((n) => Math.abs(0.7 - n) < 0.001 || Math.abs(70 - n) < 0.001) ||
        q.priceNums.some((n) => Math.abs(0.7 - n) < 0.001 || Math.abs(0.7 - n * 0.01) < 0.001);
      const textOnly = q.words.length > 0 && q.bareNums.length === 0 && q.priceNums.length === 0 && q.densityNums.length === 0 && q.thicknessNums.length === 0;
      if (q.isEmpty ? true : nameHit || priceHintHit || (numHit && !textOnly)) {
        variants.push({
          productId: product.id,
          density: null,
          thickness: null,
          matched: {
            name: nameHit || q.isEmpty,
            density: false,
            thickness: false,
            price: Boolean(numHit?.price) || priceHintHit,
          },
        });
      }
      continue;
    }

    // Blocks: product × density × thickness.
    const nameHit = productMatchesText(product, q);
    const hasNameWords = q.words.some((w) => {
      const word = normalizeLoose(w);
      return word && !DENSITY_UNIT.test(word) && !THICKNESS_UNIT.test(word) && !PRICE_UNIT.test(word);
    });
    // If the query has name words that don't match this product, skip it entirely.
    if (hasNameWords && !nameHit) continue;

    for (const density of DENSITY_VALUES) {
      if (densityFilterActive && density !== densityFilter) continue;
      for (const thickness of THICKNESS_CM) {
        if (thicknessFilterActive && thickness !== thicknessFilter) continue;
        const numMatch = q.isEmpty
          ? ({ name: false, density: false, thickness: false, price: false } as const)
          : variantMatchesNums(product.id, density, thickness, q);
        if (q.isEmpty || numMatch) {
          const matched = numMatch ?? { name: false, density: false, thickness: false, price: false };
          variants.push({
            productId: product.id,
            density,
            thickness,
            matched: {
              name: hasNameWords && nameHit,
              density: matched.density,
              thickness: matched.thickness,
              price: matched.price,
            },
          });
        }
      }
    }
  }

  // Stable ordering: product, then density, then thickness.
  const productOrder: Record<ProductId, number> = { oq: 0, qora: 1, maydalangan: 2 };
  variants.sort((a, b) => {
    const p = productOrder[a.productId] - productOrder[b.productId];
    if (p !== 0) return p;
    const d = (a.density ?? 0) - (b.density ?? 0);
    if (d !== 0) return d;
    return (a.thickness ?? 0) - (b.thickness ?? 0);
  });

  return { variants, crushedExcluded, isResultsMode: true };
}

/** Highlight helper pieces for a text label. */
export function highlightParts(text: string, query: string): { text: string; hit: boolean }[] {
  const q = normalizeText(query);
  if (!q) return [{ text, hit: false }];
  const normalizedText = normalizeText(text);
  const parts: { text: string; hit: boolean }[] = [];
  // Token-wise highlight (apostrophe-insensitive compare on slices).
  const words = text.split(/(\s+)/);
  for (const piece of words) {
    const loose = normalizeLoose(piece);
    const hit = loose.length > 0 && q.split(/[\s,;]+/).filter(Boolean).some((qt) => normalizeLoose(qt).includes(loose) || loose.includes(normalizeLoose(qt)));
    parts.push({ text: piece, hit });
  }
  return parts;
}

/** Label helpers re-exported for result rendering. */
export function variantLabels(v: Variant, densityLabel: string, thicknessLabel: string, priceLabel: string) {
  return {
    density: v.density != null ? formatDensity(v.density) : densityLabel,
    thickness: v.thickness != null ? formatThickness(v.thickness) : thicknessLabel,
    price: formatUnitPrice(v.productId, v.density),
    priceLabel,
  };
}

export function densityFromPrice(usd: number): DensityValue | null {
  for (const d of DENSITY_VALUES) {
    if (DENSITY_PRICES_USD[d] === usd) return d;
  }
  return null;
}
