"use client";

/**
 * MAHSULOTLAR — default product cards + real search/filter results mode.
 */

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PRODUCTS, type ProductId } from "@/config/products";
import { useI18n } from "@/lib/i18n";
import { useSearch } from "@/lib/search-context";
import { searchVariants } from "@/lib/search";
import { Icon } from "@/components/ui/Icons";
import { ProductCard, type CardSelection } from "./products/ProductCard";
import { ProductDetailModal } from "./products/ProductDetailModal";
import { ProductToolbar } from "./products/ProductToolbar";
import { VariantCard } from "./products/VariantCard";

const PAGE_SIZE = 12;

function ProductsInner() {
  const { t } = useI18n();
  const { query, type, density, thickness, reset } = useSearch();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [detail, setDetail] = useState<{ product: (typeof PRODUCTS)[number]; selection: CardSelection } | null>(null);

  const result = useMemo(
    () => searchVariants(query, { type, density, thickness }),
    [query, type, density, thickness],
  );

  // Reset pagination when the query changes.
  const key = `${query}|${type}|${density}|${thickness}`;
  const [lastKey, setLastKey] = useState(key);
  if (lastKey !== key) {
    setLastKey(key);
    if (visible !== PAGE_SIZE) setVisible(PAGE_SIZE);
  }

  const shown = result.variants.slice(0, visible);

  return (
    <section id="mahsulotlar" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">EPS</span>
          <h2 className="section-title mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">{t.products.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{t.products.subtitle}</p>
        </motion.div>

        <div className="mt-10">
          <ProductToolbar resultCount={result.isResultsMode ? result.variants.length : PRODUCTS.length} />
        </div>

        {result.isResultsMode && result.crushedExcluded && (
          <p className="glass-soft mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-ink-muted">
            <Icon name="alert" className="h-4 w-4 text-cyan" />
            {t.products.crushedNote}
          </p>
        )}

        {/* Default view: 3 large product cards */}
        {!result.isResultsMode ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.filter((p) => type === "all" || p.id === type).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetail={(selection) => setDetail({ product, selection })}
              />
            ))}
          </div>
        ) : result.variants.length === 0 ? (
          /* No results */
          <div className="glass mt-10 flex flex-col items-center gap-4 rounded-card px-6 py-16 text-center">
            <span className="glass-soft flex h-16 w-16 items-center justify-center rounded-full text-cyan">
              <Icon name="search" className="h-7 w-7" />
            </span>
            <h3 className="section-title text-xl">{t.products.emptyTitle}</h3>
            <button type="button" onClick={reset} className="btn-primary mt-2 px-6 py-3 text-xs font-bold">
              {t.products.emptyReset}
            </button>
          </div>
        ) : (
          /* Results mode: variant cards */
          <>
            <div className="mt-8 grid gap-4">
              {shown.map((v) => (
                <VariantCard key={`${v.productId}-${v.density}-${v.thickness}`} variant={v} query={query} />
              ))}
            </div>
            {visible < result.variants.length && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE_SIZE)}
                  className="btn-ghost px-7 py-3.5 text-sm font-bold"
                >
                  {t.products.showMore}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProductDetailModal
        product={detail?.product ?? null}
        selection={detail?.selection ?? { density: 15, thickness: 10 }}
        onClose={() => setDetail(null)}
      />
    </section>
  );
}

export function Products() {
  return <ProductsInner />;
}
