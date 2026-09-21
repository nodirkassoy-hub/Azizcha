"use client";

/**
 * Product detail modal: larger image, full spec, applications,
 * "3D da ko‘rish" jump link.
 */

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { APPLICATION_KEYS_ORDER } from "@/components/sections/Applications";
import type { ProductDef } from "@/config/products";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";
import { formatDensity, formatThickness, formatUnitPrice } from "@/lib/pricing";
import type { CardSelection } from "./ProductCard";

export function ProductDetailModal({
  product,
  selection,
  onClose,
}: {
  product: ProductDef | null;
  selection: CardSelection;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { openOrder } = useOrder();
  const crushed = product ? !product.hasDensity && !product.hasThickness : false;
  const name = product ? t.products.names[product.id] : "";

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={name} className="max-w-2xl">
      {product && (
        <div className="p-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-card">
            <Image src={product.image} alt={name} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink-muted">{t.products.detailText[product.id]}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="glass-soft rounded-2xl px-4 py-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">{t.products.densityLabel}</dt>
              <dd className="mt-1 font-semibold text-ink">
                {crushed ? "—" : formatDensity(selection.density)}
              </dd>
            </div>
            <div className="glass-soft rounded-2xl px-4 py-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">{t.products.thicknessLabel}</dt>
              <dd className="mt-1 font-semibold text-ink">
                {crushed ? "—" : formatThickness(selection.thickness)}
              </dd>
            </div>
            <div className="glass-soft col-span-2 rounded-2xl px-4 py-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">{t.products.priceLabel}</dt>
              <dd className="mt-1 font-display text-xl font-bold text-gradient">
                {formatUnitPrice(product.id, crushed ? null : selection.density)}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">{t.products.applicationsLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {APPLICATION_KEYS_ORDER.filter((key) => product.applications.includes(key)).map((key) => (
                <span key={key} className="glass-soft rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink">
                  {t.applications.items[key]}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <a
              href="#3d-tajriba"
              onClick={onClose}
              className="btn-ghost flex-1 px-5 py-3 text-xs font-bold"
            >
              {t.products.view3d}
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                openOrder(
                  crushed
                    ? { productId: product.id }
                    : { productId: product.id, density: selection.density, thickness: selection.thickness },
                );
              }}
              className="btn-primary flex-1 px-5 py-3 text-xs font-bold"
            >
              {t.products.order}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
