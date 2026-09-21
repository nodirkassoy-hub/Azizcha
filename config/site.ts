/**
 * IZO PLUS — PENAPLAST ZAVODI
 * Central editable configuration: contacts, prices, units.
 * Owner-editable values live here — change them without touching components.
 */

export const SITE = {
  brandName: "IZO PLUS",
  tagline: "PENAPLAST ZAVODI",
} as const;

export const CONTACT = {
  phoneDisplay: "+998 99 513 22 22",
  phoneTel: "+998995132222",
  telegramUser: "penaplast_uz",
  telegramUrl: "https://t.me/penaplast_uz",
} as const;

/** Optional contact fields. Leave empty to hide them on the page. */
export const CONTACT_OPTIONAL = {
  address: "",
  email: "",
} as const;

/** kg/m³ -> USD. Price of OQ and QORA penaplast depends only on density. */
export const DENSITY_PRICES_USD = {
  7: 32,
  10: 40,
  12: 50,
  14: 62,
  15: 67,
  16: 71,
  18: 79,
  20: 87,
} as const;

export type DensityValue = keyof typeof DENSITY_PRICES_USD;

/** Density options in kg/m³ (order as shown in selectors and the order form). */
export const DENSITY_VALUES = Object.keys(DENSITY_PRICES_USD).map(Number) as DensityValue[];

/** Thickness options in cm. MAX 60. Never add > 60. */
export const THICKNESS_CM = [1, 2, 3, 5, 10, 15, 20, 30, 40, 50, 60] as const;

export type ThicknessValue = (typeof THICKNESS_CM)[number];

/** Crushed penaplast: 70 cents PER KILOGRAM (not per piece). */
export const CRUSHED_PRICE_USD_PER_KG = 0.7;

/** Optional unit suffix for block prices, e.g. "/ dona" or "/ m³". Empty renders bare "$67". */
export const PRICE_UNIT_LABEL_BLOCKS = "";

/** Show "Taxminiy jami" (approximate total) in the order summary. */
export const SHOW_ORDER_TOTAL = true;

/** Quantity limits for the order form. */
export const QUANTITY_MIN = 1;
export const QUANTITY_MAX = 100000;

/** Units used in the order form. */
export const UNIT_BLOCKS = "dona";
export const UNIT_CRUSHED = "kg";

/** Editable extra paragraph for the About section (verified facts only). */
export const ABOUT_EXTRA = "";

/** Telegram order notification language (the message sent to the factory chat). */
export type SiteLang = "uz" | "ru" | "en";
export const ORDER_MESSAGE_LANG: SiteLang = "uz";
