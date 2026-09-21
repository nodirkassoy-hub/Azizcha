"use client";

/**
 * Live order summary panel — updates instantly from form state.
 * Prices come from the shared pricing module (server recomputes too).
 */

import type { ProductId } from "@/config/products";
import { SHOW_ORDER_TOTAL, type DensityValue, type ThicknessValue } from "@/config/site";
import { useI18n } from "@/lib/i18n";
import { formatDensity, formatThickness, formatUsd, getQuantityUnit, getUnitPriceUsd } from "@/lib/pricing";

export interface SummaryState {
  productId: ProductId;
  density: DensityValue | null;
  thickness: ThicknessValue | null;
  quantity: number;
}

export function OrderSummary({ state }: { state: SummaryState }) {
  const { t } = useI18n();
  const crushed = state.productId === "maydalangan";
  const unit = getQuantityUnit(state.productId);
  const unitPrice = getUnitPriceUsd(state.productId, state.density);
  const total = unitPrice * Math.max(0, state.quantity);

  const rows: { label: string; value: string }[] = [
    { label: t.order.summary.product, value: t.products.names[state.productId] },
  ];
  if (!crushed) {
    rows.push({
      label: t.order.summary.density,
      value: state.density != null ? formatDensity(state.density) : t.order.dash,
    });
    rows.push({
      label: t.order.summary.thickness,
      value: state.thickness != null ? formatThickness(state.thickness) : t.order.dash,
    });
  }
  rows.push({ label: t.order.summary.quantity, value: `${state.quantity} ${unit}` });
  rows.push({
    label: t.order.summary.price,
    value: crushed ? `${formatUsd(unitPrice)} / KG` : formatUsd(unitPrice),
  });
  if (SHOW_ORDER_TOTAL) {
    rows.push({ label: t.order.summary.total, value: formatUsd(total) });
  }

  return (
    <div className="glass-soft rounded-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">{t.order.summaryTitle}</p>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd
              className={
                row.label === t.order.summary.total
                  ? "font-display text-lg font-bold text-gradient"
                  : "font-semibold text-ink"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {SHOW_ORDER_TOTAL && <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">{t.order.totalNote}</p>}
    </div>
  );
}
