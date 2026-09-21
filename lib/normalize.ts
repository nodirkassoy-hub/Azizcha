/**
 * Text normalization helpers: apostrophe-insensitive, case-insensitive matching.
 * o‘, o', o`, ʻo are all equal.
 */

const APOSTROPHES = /['‘’ʼ`ʻʹ´]/g;

/** Lowercase + unify apostrophes + collapse whitespace. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(APOSTROPHES, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Aggressive form for matching: apostrophes removed entirely. */
export function normalizeLoose(input: string): string {
  return normalizeText(input).replace(/'/g, "");
}

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** ---- Phone helpers (+998 mask) ---- */

/** Keep digits only. */
export function phoneDigits(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Normalize to +998XXXXXXXXX (9 digits after the code).
 * Accepts local formats like "99 513 22 22", "998995132222", "+998 (99) 513-22-22".
 * Returns null when the number is invalid.
 */
export function normalizePhone(input: string): string | null {
  let digits = phoneDigits(input);
  // Strip the 998 country code only when more than 9 digits were entered
  // (a 9-digit local number may itself start with "998").
  if (digits.length > 9 && digits.startsWith("998")) digits = digits.slice(3);
  if (digits.length !== 9) return null;
  return `+998${digits}`;
}

/** Pretty display format for an already normalized number: +998 99 513 22 22. */
export function formatPhoneDisplay(normalized: string): string {
  const digits = phoneDigits(normalized);
  const local = digits.startsWith("998") ? digits.slice(3) : digits;
  if (local.length !== 9) return normalized;
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
}

/** Masked editing helper: formats what the user typed under the +998 mask. */
export function maskPhoneInput(input: string): string {
  let digits = phoneDigits(input);
  if (digits.length > 9 && digits.startsWith("998")) digits = digits.slice(3);
  const local = digits.slice(0, 9);
  if (!local) return "";
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(
    (p) => p.length > 0,
  );
  return `+998 ${parts.join(" ")}`;
}
