"use client";

/**
 * Navbar search overlay — live product/variant results, keyboard navigable.
 * Enter applies the query to the products section and scrolls there;
 * clicking a result opens the order modal prefilled.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS } from "@/config/products";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";
import { useSearch } from "@/lib/search-context";
import { formatDensity, formatThickness, formatUnitPrice } from "@/lib/pricing";
import { searchVariants, type Variant } from "@/lib/search";
import { useFocusTrap, useLockBodyScroll } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const MAX_PREVIEW = 8;

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { query, setQuery, type, density, thickness, reset } = useSearch();
  const { openOrder } = useOrder();
  const [value, setValue] = useState(query);
  const [cursor, setCursor] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => searchVariants(value, { type, density, thickness }), [value, type, density, thickness]);
  const previews = result.variants.slice(0, MAX_PREVIEW);

  useEffect(() => {
    if (open) {
      setValue(query);
      setCursor(0);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useFocusTrap(panelRef, open, onClose);
  useLockBodyScroll(open);

  const goProducts = (finalQuery: string) => {
    setQuery(finalQuery);
    onClose();
    document.getElementById("mahsulotlar")?.scrollIntoView({ behavior: "smooth" });
  };

  const pickVariant = (v: Variant) => {
    onClose();
    openOrder({
      productId: v.productId,
      density: v.density ?? undefined,
      thickness: v.thickness ?? undefined,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (value) {
        setValue("");
        setQuery("");
      } else {
        onClose();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(previews.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (previews[cursor]) pickVariant(previews[cursor]);
      else goProducts(value);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="close" onClick={onClose} className="absolute inset-0 cursor-default bg-[rgba(2,8,20,0.65)] backdrop-blur-md" />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 w-full max-w-2xl overflow-hidden rounded-card"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-glass-border px-5 py-4">
              <Icon name="search" className="text-cyan" />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setCursor(0);
                }}
                placeholder={t.search.placeholder}
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
                aria-label={t.search.open}
              />
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    setQuery("");
                  }}
                  className="text-ink-muted hover:text-ink"
                  aria-label="clear"
                >
                  <Icon name="close" />
                </button>
              )}
            </div>

            <div ref={listRef} className="scrollbar-thin max-h-[50vh] overflow-y-auto p-2">
              {value.length > 0 && (
                <p className="px-3 py-2 text-xs uppercase tracking-wider text-ink-muted">
                  {result.variants.length > 0 ? t.search.count(result.variants.length) : t.search.empty}
                </p>
              )}
              {value.length > 0 &&
                previews.map((v, i) => {
                  const product = PRODUCTS.find((p) => p.id === v.productId)!;
                  return (
                    <button
                      key={`${v.productId}-${v.density}-${v.thickness}`}
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => pickVariant(v)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors",
                        i === cursor ? "bg-cyan-soft" : "hover:bg-cyan-soft",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{t.products.names[v.productId]}</span>
                        <span className="block truncate text-xs text-ink-muted">
                          {v.density != null ? formatDensity(v.density) : t.order.dash}
                          {" · "}
                          {v.thickness != null ? formatThickness(v.thickness) : t.order.dash}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-cyan">
                        {formatUnitPrice(v.productId, v.density)}
                      </span>
                    </button>
                  );
                })}
              {value.length > 0 && previews.length === 0 && (
                <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-ink-muted">
                  <Icon name="search" className="h-8 w-8 opacity-50" />
                  <p className="text-sm">{t.search.empty}</p>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setValue("");
                    }}
                    className="glass-soft btn px-4 py-2 text-xs"
                  >
                    {t.products.emptyReset}
                  </button>
                </div>
              )}
              {value.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-ink-muted">{t.search.hint}</p>
              )}
            </div>

            {result.variants.length > MAX_PREVIEW && (
              <button
                type="button"
                onClick={() => goProducts(value)}
                className="border-t border-glass-border px-5 py-3.5 text-center text-sm font-semibold text-cyan hover:underline"
              >
                {t.products.resultsCount(result.variants.length)} →
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
