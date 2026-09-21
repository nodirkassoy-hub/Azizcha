/**
 * IZO PLUS — product structure and search data.
 * Display names/descriptions live in content/ (per language).
 */

export type ProductId = "oq" | "qora" | "maydalangan";

export interface ProductDef {
  id: ProductId;
  /** Has density options (OQ / QORA). */
  hasDensity: boolean;
  /** Has thickness options (OQ / QORA). */
  hasThickness: boolean;
  /** Product photo. */
  image: string;
  /** 3D viewer mode for this product. */
  viewer: "block-white" | "block-black" | "granules";
  /** Application keys (see content applications lists). */
  applications: string[];
  /** Multilingual search synonyms (apostrophe- and case-insensitive). */
  synonyms: string[];
}

export const PRODUCTS: ProductDef[] = [
  {
    id: "oq",
    hasDensity: true,
    hasThickness: true,
    image: "/images/products/oq.jpg",
    viewer: "block-white",
    applications: ["uy", "binolar", "devor", "tom", "pol", "sovutish", "qadoqlash"],
    synonyms: ["oq", "oq penaplast", "beliy", "белый", "white", "oq penoplast", "ok"],
  },
  {
    id: "qora",
    hasDensity: true,
    hasThickness: true,
    image: "/images/products/qora.jpg",
    viewer: "block-black",
    applications: ["uy", "binolar", "devor", "tom", "pol"],
    synonyms: ["qora", "qora penaplast", "cherniy", "чёрный", "черный", "black", "qora penoplast", "grafit"],
  },
  {
    id: "maydalangan",
    hasDensity: false,
    hasThickness: false,
    image: "/images/products/maydalangan.jpg",
    viewer: "granules",
    applications: ["qadoqlash", "pol", "devor"],
    synonyms: [
      "maydalangan",
      "maydalangan penaplast",
      "дроблёный",
      "дробленый",
      "crushed",
      "granula",
      "granules",
      "mayda",
    ],
  },
];

export const PRODUCT_IDS: ProductId[] = PRODUCTS.map((p) => p.id);

export function getProduct(id: ProductId): ProductDef {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}

/** Keywords that suggest the crushed product / per-kg price. */
export const CRUSHED_PRICE_KEYWORDS = ["kg", "kг", "kg/m3", "granula", "maydalangan", "crushed", "0.7", "70"];
