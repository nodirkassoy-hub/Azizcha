import { en } from "./en";
import { ru } from "./ru";
import { uz, type Dictionary } from "./uz";

export type SiteLang = "uz" | "ru" | "en";

export const LANGS: { id: SiteLang; label: string }[] = [
  { id: "uz", label: "UZ" },
  { id: "ru", label: "RU" },
  { id: "en", label: "EN" },
];

export const dictionaries: Record<SiteLang, Dictionary> = { uz, ru, en };

export type { Dictionary };
export { uz, ru, en };
