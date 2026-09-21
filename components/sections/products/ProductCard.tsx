"use client";

/**
 * Large product card (default view) with density/thickness chip selectors,
 * animated live price, and detail / order actions.
 * Desktop-only hover tilt.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProductDef } from "@/config/products";
import { DENSITY_VALUES, THICKNESS_CM, type DensityValue, type ThicknessValue } from "@/config/site";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";
import { formatUnitPrice } from "@/lib/pricing";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DensityChips, ThicknessChips } from "./SelectorChips";

export interface CardSelection {
  density: DensityValue;
  thickness: ThicknessValue;
}

export function ProductCard({
  product,
  onDetail,
}: {
  product: ProductDef;
  onDetail: (selection: CardSelection) => void;
}) {
  const { t } = useI18n();
  const { openOrder } = useOrder();
  const crushed = !product.hasDensity && !product.hasThickness;
  const [density, setDensity] = useState<DensityValue>(15);
  const [thickness, setThickness] = useState<ThicknessValue>(10);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const price = formatUnitPrice(product.id, crushed ? null : density);
  const name = t.products.names[product.id];

  const onMouseMove = (e: React.MouseEvent) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 5, y: px * 6 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: tilt.x, rotateY: tilt.y }}
      className="card-tilt glass group relative flex flex-col overflow-hidden rounded-card transition-shadow duration-500 hover:glow-ring"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,10,20,0.55)] via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="section-title text-xl text-ink">{name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{t.products.shortApps[product.id]}</p>
        </div>

        {crushed ? (
          <div className="grid grid-cols-2 gap-3 text-sm text-ink-muted">
            <div className="glass-soft rounded-2xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.products.densityLabel}</p>
              <p className="mt-1 text-ink">—</p>
            </div>
            <div className="glass-soft rounded-2xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.products.thicknessLabel}</p>
              <p className="mt-1 text-ink">—</p>
            </div>
          </div>
        ) : (
          <>
            <DensityChips
              label={t.products.densityLabel}
              options={DENSITY_VALUES}
              value={density}
              onChange={setDensity}
            />
            <ThicknessChips
              label={t.products.thicknessLabel}
              options={THICKNESS_CM}
              value={thickness}
              onChange={setThickness}
            />
          </>
        )}

        <div className="mt-auto flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">{t.products.priceLabel}</p>
            <PriceDisplay value={price} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onDetail({ density, thickness })}
            className="btn-ghost flex-1 px-5 py-3 text-xs font-bold"
          >
            {t.products.detail}
          </button>
          <button
            type="button"
            onClick={() =>
              openOrder(
                crushed
                  ? { productId: product.id }
                  : { productId: product.id, density, thickness },
              )
            }
            className="btn-primary flex-1 px-5 py-3 text-xs font-bold"
          >
            {t.products.order}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
