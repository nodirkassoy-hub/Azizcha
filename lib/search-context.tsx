"use client";

/**
 * Shared products-search state (navbar overlay ⇄ products toolbar).
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { DensityValue, ThicknessValue } from "@/config/site";
import type { ProductId } from "@/config/products";

interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  type: ProductId | "all";
  setType: (t: ProductId | "all") => void;
  density: DensityValue | "all";
  setDensity: (d: DensityValue | "all") => void;
  thickness: ThicknessValue | "all";
  setThickness: (t: ThicknessValue | "all") => void;
  reset: () => void;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ProductId | "all">("all");
  const [density, setDensity] = useState<DensityValue | "all">("all");
  const [thickness, setThickness] = useState<ThicknessValue | "all">("all");

  const reset = useCallback(() => {
    setQuery("");
    setType("all");
    setDensity("all");
    setThickness("all");
  }, []);

  const value = useMemo(
    () => ({ query, setQuery, type, setType, density, setDensity, thickness, setThickness, reset }),
    [query, type, density, thickness, reset],
  );
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
