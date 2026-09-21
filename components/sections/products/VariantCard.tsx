"use client";

/**
 * Variant result card — one concrete product × density × thickness
 * (search / filter results mode).
 */

import Image from "next/image";
import { PRODUCTS } from "@/config/products";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";
import { formatDensity, formatThickness, formatUnitPrice } from "@/lib/pricing";
import { highlightParts, type Variant } from "@/lib/search";
import { cn } from "@/lib/utils";

function Highlighted({ text, query, active }: { text: string; query: string; active: boolean }) {
  if (!active || !query) return <>{text}</>;
  return (
    <>
      {highlightParts(text, query).map((part, i) =>
        part.hit ? (
          <mark key={i} className="rounded bg-[var(--mark-bg)] px-0.5 text-[var(--mark-text)]">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function VariantCard({ variant, query }: { variant: Variant; query: string }) {
  const { t } = useI18n();
  const { openOrder } = useOrder();
  const product = PRODUCTS.find((p) => p.id === variant.productId)!;
  const name = t.products.names[variant.productId];
  const crushed = variant.density == null && variant.thickness == null;

  return (
    <article className="glass group flex items-center gap-4 rounded-card p-4 transition-all duration-300 hover:glow-ring">
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
        <Image
          src={product.image}
          alt={name}
          fill
          sizes="96px"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            "group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]",
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-ink">
          <Highlighted text={name} query={query} active={variant.matched.name} />
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
          <span className={cn(variant.matched.density && "text-cyan")}>
            {crushed ? (
              t.order.dash
            ) : (
              <Highlighted text={formatDensity(variant.density!)} query={query} active={variant.matched.density} />
            )}
          </span>
          <span>·</span>
          <span className={cn(variant.matched.thickness && "text-cyan")}>
            {crushed ? (
              t.order.dash
            ) : (
              <Highlighted text={formatThickness(variant.thickness!)} query={query} active={variant.matched.thickness} />
            )}
          </span>
        </p>
        <p className={cn("mt-1 text-sm font-bold text-gradient", variant.matched.price && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
          <Highlighted
            text={formatUnitPrice(variant.productId, variant.density)}
            query={query}
            active={variant.matched.price}
          />
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          openOrder({
            productId: variant.productId,
            density: variant.density ?? undefined,
            thickness: variant.thickness ?? undefined,
          })
        }
        className="btn-primary shrink-0 px-4 py-2.5 text-[11px] font-bold"
      >
        {t.products.order}
      </button>
    </article>
  );
}
