"use client";

/**
 * Hero — full-viewport cinematic background (video with poster fallback),
 * no 3D. Exact copy, stat chips from real data, scroll indicator.
 */

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";
import { useMediaQuery } from "@/lib/hooks";

export function Hero() {
  const { t } = useI18n();
  const { openOrder } = useOrder();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Poster with a slow subtle scale; used when video is missing/fails or reduced motion.
  const showPoster = videoFailed || reducedMotion;

  useEffect(() => {
    if (reducedMotion) videoRef.current?.pause();
  }, [reducedMotion]);

  return (
    <section id="bosh" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-28 sm:justify-center sm:pb-24">
      {/* Background media */}
      <div className="absolute inset-0 -z-10">
        <motion.img
          src="/media/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          initial={{ scale: 1.08 }}
          animate={showPoster ? { scale: 1 } : { scale: 1.06 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="h-full w-full object-cover"
        />
        {!showPoster && (
          <video
            ref={videoRef}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            poster="/media/hero-poster.jpg"
            onError={() => setVideoFailed(true)}
            onCanPlay={(e) => e.currentTarget.play().catch(() => setVideoFailed(true))}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/media/hero-factory-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
            <source src="/media/hero-factory.mp4" type="video/mp4" />
            <source src="/media/hero-factory.webm" type="video/webm" />
          </video>
        )}
        {/* Dark blue-tinted overlay + vignette + faint blueprint grid */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(4,10,20,0.82) 0%, rgba(4,10,20,0.55) 40%, rgba(4,10,20,0.88) 100%), radial-gradient(1200px 500px at 70% 20%, rgba(34,211,238,0.18), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 grid-blueprint opacity-60"
          style={{ maskImage: "radial-gradient(90% 70% at 50% 50%, black 30%, transparent 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(2,6,14,0.75) 100%)" }}
        />
      </div>

      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,7vw,5rem)] font-bold uppercase leading-[1.02] tracking-tight">
            <span className="block text-ink">{t.hero.h1Line1}</span>
            <span className="block text-gradient">{t.hero.h1Line2}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">{t.hero.description}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#mahsulotlar" className="btn-primary px-7 py-4 text-sm">
              {t.hero.ctaPrimary}
            </a>
            <button type="button" onClick={() => openOrder()} className="btn-ghost px-7 py-4 text-sm">
              {t.hero.ctaSecondary}
            </button>
          </div>

          {/* Real-data stat chips */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[t.hero.statProducts, t.hero.statDensity, t.hero.statThickness].map((stat) => (
              <span key={stat} className="glass rounded-full px-5 py-2.5 text-sm font-semibold text-ink">
                {stat}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#mahsulotlar"
        aria-label={t.hero.scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.2, duration: 0.6 },
          y: { delay: 1.2, duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-ink-muted sm:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.35em]">{t.hero.scroll}</span>
        <Icon name="arrow-down" className="h-4 w-4 text-cyan" />
      </motion.a>
    </section>
  );
}
