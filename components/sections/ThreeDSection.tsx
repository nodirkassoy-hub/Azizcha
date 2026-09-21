"use client";

/**
 * 3D TAJRIBA — strong section with the realistic EPS block viewer.
 * Lazy-loads the WebGL canvas near the viewport, pauses off-screen,
 * graceful fallback when WebGL is unavailable.
 */

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, type ProductDef, type ProductId } from "@/config/products";
import { DENSITY_VALUES, THICKNESS_CM, type DensityValue, type ThicknessValue } from "@/config/site";
import { useI18n } from "@/lib/i18n";
import { useInView, useLowPowerDevice, useOnceInView, useWebGLSupport } from "@/lib/hooks";
import { useOrder } from "@/lib/order-context";
import { formatDensity, formatThickness } from "@/lib/pricing";
import { Icon } from "@/components/ui/Icons";
import { Spinner } from "@/components/ui/Spinner";
import { FallbackViewer } from "@/components/three/FallbackViewer";
import type { CameraApi } from "@/components/three/EpsViewer";
import { cn } from "@/lib/utils";
import { BeadsMacro } from "./BeadsMacro";

const EpsViewer = dynamic(() => import("@/components/three/EpsViewer"), {
  ssr: false,
  loading: () => null,
});

export function ThreeDSection() {
  const { t } = useI18n();
  const { openOrder } = useOrder();
  const [sectionRef, loaded] = useOnceInView<HTMLDivElement>("300px");
  const [wrapperRef, inView] = useInView<HTMLDivElement>("200px");
  const webgl = useWebGLSupport();
  const lowPower = useLowPowerDevice();

  const [productId, setProductId] = useState<ProductId>("oq");
  const [thickness, setThickness] = useState<ThicknessValue>(10);
  const [density, setDensity] = useState<DensityValue>(15);
  const [autoRotate, setAutoRotate] = useState(true);
  const [interactive, setInteractive] = useState(false);
  const apiRef = useRef<CameraApi | null>(null);

  const product = PRODUCTS.find((p) => p.id === productId) as ProductDef;
  const crushed = product.viewer === "granules";
  const showCanvas = loaded && webgl === true;

  return (
    <section id="3d-tajriba" ref={sectionRef} className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">3D</span>
          <h2 className="section-title mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">{t.threeD.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{t.threeD.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Viewer */}
          <div
            ref={wrapperRef}
            className="glass relative aspect-[4/3] max-h-[75vh] w-full overflow-hidden rounded-card sm:aspect-[16/10]"
          >
            {webgl === false ? (
              <FallbackViewer note={t.threeD.fallbackNote} />
            ) : showCanvas ? (
              <EpsViewer
                mode={product.viewer}
                thicknessCm={thickness}
                density={density}
                autoRotate={autoRotate}
                paused={!inView}
                interactive={interactive}
                onInteract={() => setInteractive(true)}
                apiRef={apiRef}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center gap-3 text-ink-muted">
                <Spinner className="h-6 w-6" />
                <span className="text-sm">{t.threeD.loading}</span>
              </div>
            )}

            {/* Touch activation overlay — page scroll is never trapped */}
            {showCanvas && !interactive && (
              <button
                type="button"
                onClick={() => setInteractive(true)}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[rgba(4,10,20,0.35)] backdrop-blur-[2px]"
              >
                <span className="glass-strong btn px-6 py-3 text-sm text-ink">{t.threeD.activate}</span>
                <span className="max-w-[240px] text-center text-[11px] text-ink-muted">{t.threeD.activateHint}</span>
              </button>
            )}
            {showCanvas && interactive && (
              <button
                type="button"
                onClick={() => setInteractive(false)}
                className="glass absolute right-4 top-4 z-10 rounded-full px-4 py-2 text-xs font-semibold text-ink"
              >
                {t.threeD.exit}
              </button>
            )}

            {/* On-screen controls */}
            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
              <button
                type="button"
                aria-label={t.threeD.zoomIn}
                onClick={() => apiRef.current?.zoomBy(0.8)}
                className="glass btn h-11 w-11 !p-0 text-ink"
              >
                <Icon name="plus" />
              </button>
              <button
                type="button"
                aria-label={t.threeD.zoomOut}
                onClick={() => apiRef.current?.zoomBy(1.25)}
                className="glass btn h-11 w-11 !p-0 text-ink"
              >
                <Icon name="minus" />
              </button>
              <button
                type="button"
                aria-label={t.threeD.resetView}
                onClick={() => apiRef.current?.reset()}
                className="glass btn h-11 w-11 !p-0 text-ink"
              >
                <Icon name="reset" />
              </button>
            </div>
          </div>

          {/* Control panel */}
          <div className="glass flex flex-col gap-5 rounded-card p-6">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">{t.threeD.productLabel}</p>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProductId(p.id)}
                    aria-pressed={productId === p.id}
                    className={cn("chip text-xs", productId === p.id && "chip-active")}
                  >
                    {t.products.names[p.id]}
                  </button>
                ))}
              </div>
            </div>

            {!crushed && (
              <>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                    {t.threeD.densityLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DENSITY_VALUES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDensity(d)}
                        aria-pressed={density === d}
                        className={cn("chip px-3 text-xs", density === d && "chip-active")}
                      >
                        {formatDensity(d)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                    {t.threeD.thicknessLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {THICKNESS_CM.map((th) => (
                      <button
                        key={th}
                        type="button"
                        onClick={() => setThickness(th)}
                        aria-pressed={thickness === th}
                        className={cn("chip px-3 text-xs", thickness === th && "chip-active")}
                      >
                        {formatThickness(th)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-ink-muted">{t.threeD.illustration}</p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              className="glass-soft btn justify-start px-4 py-3 text-xs font-semibold text-ink"
              aria-pressed={autoRotate}
            >
              <Icon name="rotate" className="text-cyan" />
              {autoRotate ? t.threeD.autoRotateOn : t.threeD.autoRotateOff}
            </button>

            <button
              type="button"
              onClick={() =>
                openOrder(
                  crushed
                    ? { productId }
                    : { productId, density, thickness },
                )
              }
              className="btn-primary mt-auto py-4 text-sm"
            >
              {t.threeD.order}
            </button>
          </div>
        </div>
      </div>

      {/* PENAPLAST DONALARI */}
      <BeadsMacro />
    </section>
  );
}
