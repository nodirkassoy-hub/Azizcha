/**
 * Shared pure price computation — used by BOTH the client UI and the server
 * (the server always recomputes the price and ignores any client-sent price).
 */

import {
  CRUSHED_PRICE_USD_PER_KG,
  DENSITY_PRICES_USD,
  DENSITY_VALUES,
  PRICE_UNIT_LABEL_BLOCKS,
  THICKNESS_CM,
  UNIT_BLOCKS,
  UNIT_CRUSHED,
  type DensityValue,
  type ThicknessValue,
} from "@/config/site";
import type { ProductId } from "@/config/products";

export type { DensityValue, ThicknessValue, ProductId };
export { DENSITY_VALUES, THICKNESS_CM };

/** Unit price in USD for a product variant. Blocks: density only. Crushed: per kg. */
export function getUnitPriceUsd(productId: ProductId, density?: DensityValue | null): number {
  if (productId === "maydalangan") return CRUSHED_PRICE_USD_PER_KG;
  if (density == null || !(density in DENSITY_PRICES_USD)) {
    throw new Error("Density is required for block products");
  }
  return DENSITY_PRICES_USD[density];
}

/** Approximate total = unit price × quantity. */
export function getLineTotalUsd(
  productId: ProductId,
  density: DensityValue | null,
  quantity: number,
): number {
  return getUnitPriceUsd(productId, density) * quantity;
}

/** "dona" for OQ/QORA blocks, "kg" for crushed. */
export function getQuantityUnit(productId: ProductId): string {
  return productId === "maydalangan" ? UNIT_CRUSHED : UNIT_BLOCKS;
}

/** Format USD amounts exactly as in the data: $67, $1,340, $0.70. */
export function formatUsd(amount: number): string {
  if (Number.isInteger(amount)) {
    return `$${amount.toLocaleString("en-US")}`;
  }
  return `$${(Math.round(amount * 100) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Unit price label: "$67" (+ optional configured suffix) or "$0.70 / KG". */
export function formatUnitPrice(productId: ProductId, density?: DensityValue | null): string {
  const price = formatUsd(getUnitPriceUsd(productId, density));
  if (productId === "maydalangan") return `${price} / KG`;
  return PRICE_UNIT_LABEL_BLOCKS ? `${price} ${PRICE_UNIT_LABEL_BLOCKS}` : price;
}

export function formatDensity(value: DensityValue): string {
  return `${value} kg/m³`;
}

export function formatThickness(value: ThicknessValue): string {
  return `${value} cm`;
}
