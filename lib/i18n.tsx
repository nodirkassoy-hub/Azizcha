"use client";

/**
 * Tiny custom i18n layer. Language is persisted in localStorage.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary, type SiteLang } from "@/content";

const STORAGE_KEY = "izo-plus-lang";

interface I18nContextValue {
  lang: SiteLang;
  setLang: (lang: SiteLang) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>("uz");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "uz" || saved === "ru" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((next: SiteLang) => setLangState(next), []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
