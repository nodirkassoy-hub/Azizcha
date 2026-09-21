"use client";

/**
 * Products toolbar (glass): search, type chips, density filter,
 * thickness filter, "Tozalash" reset. All filters really combine.
 */

import { useEffect, useRef, useState } from "react";
import type { ProductId } from "@/config/products";
import { DENSITY_VALUES, THICKNESS_CM, type DensityValue, type ThicknessValue } from "@/config/site";
import { useDebouncedValue } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useSearch } from "@/lib/search-context";
import { formatDensity, formatThickness } from "@/lib/pricing";
import { Icon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const TYPE_CHIPS: { id: ProductId | "all"; key: "filterAll" | "names" }[] = [
  { id: "all", key: "filterAll" },
  { id: "oq", key: "names" },
  { id: "qora", key: "names" },
  { id: "maydalangan", key: "names" },
];

export function ProductToolbar({ resultCount }: { resultCount: number }) {
  const { t } = useI18n();
  const { query, setQuery, type, setType, density, setDensity, thickness, setThickness, reset } = useSearch();
  const [value, setValue] = useState(query);
  const debounced = useDebouncedValue(value, 150);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef(query);

  // Debounced emission into shared state (150ms).
  useEffect(() => {
    if (debounced !== lastEmitted.current) {
      lastEmitted.current = debounced;
      setQuery(debounced);
    }
  }, [debounced, setQuery]);

  // External query changes (navbar overlay).
  useEffect(() => {
    if (query !== lastEmitted.current) {
      lastEmitted.current = query;
      setValue(query);
    }
  }, [query]);

  const isFiltered = query.length > 0 || density !== "all" || thickness !== "all" || type !== "all";

  return (
    <div className="glass rounded-card p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="glass-soft flex items-center gap-3 rounded-full px-5 py-3">
          <Icon name="search" className="shrink-0 text-cyan" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                if (value) {
                  setValue("");
                  setQuery("");
                }
              }
            }}
            placeholder={t.products.searchPlaceholder}
            aria-label={t.products.searchPlaceholder}
            className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
          {value && (
            <button type="button" aria-label="clear" onClick={() => { setValue(""); setQuery(""); }} className="text-ink-muted hover:text-ink">
              <Icon name="close" className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="type">
          {TYPE_CHIPS.map((chip) => {
            const label = chip.id === "all" ? t.products.filterAll : t.products.names[chip.id as ProductId];
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setType(chip.id)}
                aria-pressed={type === chip.id}
                className={cn("chip", type === chip.id && "chip-active")}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Density + thickness filters */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
              {t.products.filterDensityLabel}
            </span>
            <select
              value={String(density)}
              onChange={(e) => setDensity(e.target.value === "all" ? "all" : (Number(e.target.value) as DensityValue))}
              className="glass-soft w-full rounded-full px-4 py-3 text-sm text-ink outline-none"
            >
              <option value="all">{t.products.filterAny}</option>
              {DENSITY_VALUES.map((d) => (
                <option key={d} value={d}>
                  {formatDensity(d)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
              {t.products.filterThicknessLabel}
            </span>
            <select
              value={String(thickness)}
              onChange={(e) => setThickness(e.target.value === "all" ? "all" : (Number(e.target.value) as ThicknessValue))}
              className="glass-soft w-full rounded-full px-4 py-3 text-sm text-ink outline-none"
            >
              <option value="all">{t.products.filterAny}</option>
              {THICKNESS_CM.map((th) => (
                <option key={th} value={th}>
                  {formatThickness(th)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Footer row: count + reset */}
        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-xs uppercase tracking-[0.2em] text-ink-muted">
            {t.products.resultsCount(resultCount)}
          </p>
          {isFiltered && (
            <button type="button" onClick={reset} className="glass-soft btn px-4 py-2 text-xs font-semibold text-ink">
              <Icon name="reset" className="h-4 w-4" />
              {t.products.reset}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
