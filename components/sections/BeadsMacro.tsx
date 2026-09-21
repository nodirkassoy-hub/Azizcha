"use client";

/**
 * PENAPLAST DONALARI — macro sub-block under the 3D viewer.
 * WebGL InstancedMesh of fused beads with slider-driven
 * "zoom from block to bead"; photo fallback when WebGL is unavailable.
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { useInView, useOnceInView, useWebGLSupport } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Spinner } from "@/components/ui/Spinner";

const BeadsViewer = dynamic(() => import("@/components/three/BeadsViewer"), {
  ssr: false,
  loading: () => null,
});

export function BeadsMacro() {
  const { t } = useI18n();
  const [sectionRef, loaded] = useOnceInView<HTMLDivElement>("300px");
  const [wrapperRef, inView] = useInView<HTMLDivElement>("200px");
  const webgl = useWebGLSupport();
  const [zoom, setZoom] = useState(0.35);
  const [interactive, setInteractive] = useState(true);

  return (
    <div ref={sectionRef} className="mx-auto mt-16 max-w-content px-4 sm:px-6">
      <h3 className="section-title text-[clamp(1.3rem,3vw,2rem)]">{t.threeD.beads.title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{t.threeD.beads.subtitle}</p>

      <div
        ref={wrapperRef}
        className="glass relative mt-6 aspect-[16/9] max-h-[60vh] w-full overflow-hidden rounded-card"
      >
        {webgl === false ? (
          <div className="relative h-full w-full" style={{ overflow: "hidden" }}>
            <Image
              src="/images/beads-macro.jpg"
              alt={t.threeD.beads.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              style={{
                transform: `scale(${1 + zoom * 0.8})`,
                transformOrigin: "center",
                transition: "transform 0.3s ease-out",
              }}
            />
          </div>
        ) : loaded ? (
          <BeadsViewer
            zoom={zoom}
            autoRotate={!interactive}
            paused={!inView}
            interactive={interactive}
            onInteract={() => setInteractive(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center gap-3 text-ink-muted">
            <Spinner className="h-6 w-6" />
            <span className="text-sm">{t.threeD.loading}</span>
          </div>
        )}

        {/* Zoom slider */}
        <div className="glass absolute inset-x-4 bottom-4 z-10 flex items-center gap-3 rounded-full px-5 py-3">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {t.threeD.beads.zoom}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            aria-label={t.threeD.beads.zoom}
            className="h-2 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-[rgba(34,211,238,0.25)] accent-cyan"
          />
        </div>
      </div>
    </div>
  );
}
