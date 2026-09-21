"use client";

/**
 * ISHLAB CHIQARISH — 6 steps.
 * Desktop: sticky cross-fading visual + scroll-tied progress line with glowing nodes.
 * Mobile: vertical timeline with sequential reveals.
 */

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const STEP_IMAGES = [
  "/images/steps/01-xomashyo.jpg",
  "/images/steps/02-kopirtirish.jpg",
  "/images/steps/03-qoliplash.jpg",
  "/images/steps/04-kesish.jpg",
  "/images/steps/05-sifat.jpg",
  "/images/steps/06-tayyor.jpg",
];

export function Production() {
  const { t } = useI18n();
  const steps = t.production.steps;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(index);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [isDesktop, steps.length]);

  return (
    <section id="ishlab-chiqarish" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">EPS</span>
          <h2 className="section-title mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">{t.production.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{t.production.subtitle}</p>
        </motion.div>

        {isDesktop ? (
          /* Desktop: sticky visual + steps */
          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <div className="lg:sticky lg:top-28 lg:h-[560px]">
              <div className="glass relative h-full overflow-hidden rounded-card">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={STEP_IMAGES[active]}
                      alt={steps[active]?.title ?? ""}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,10,20,0.75)] via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="font-display text-6xl font-bold text-gradient">{steps[active]?.num}</p>
                      <p className="section-title mt-1 text-xl text-ink">{steps[active]?.title}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="relative flex flex-col gap-4 pl-10">
              {/* progress line */}
              <div className="absolute left-[14px] top-3 bottom-3 w-px bg-glass-border">
                <motion.div
                  className="w-px bg-gradient-to-b from-cyan to-blue"
                  animate={{ height: `${((active + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative"
                >
                  {/* glowing node */}
                  <span
                    className={cn(
                      "absolute -left-10 top-8 h-3 w-3 -translate-x-[2px] rounded-full transition-all duration-500",
                      i <= active
                        ? "bg-cyan shadow-[0_0_14px_rgba(34,211,238,0.9)]"
                        : "bg-glass-border",
                    )}
                  />
                  <div
                    className={cn(
                      "glass rounded-card p-6 transition-all duration-500",
                      i === active ? "glow-ring" : "opacity-70",
                    )}
                  >
                    <p className="font-display text-3xl font-bold text-gradient">{step.num}</p>
                    <h3 className="section-title mt-2 text-base text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Mobile: vertical timeline */
          <div className="relative mt-12 pl-10">
            <div className="absolute left-[10px] top-2 bottom-2 w-px bg-glass-border" />
            <div className="flex flex-col gap-6">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative"
                >
                  <span
                    className={cn(
                      "absolute -left-10 top-7 h-3 w-3 -translate-x-[1px] rounded-full transition-all duration-500",
                      i <= active ? "bg-cyan shadow-[0_0_14px_rgba(34,211,238,0.9)]" : "bg-glass-border",
                    )}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="glass overflow-hidden rounded-card"
                  >
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={STEP_IMAGES[i]}
                        alt={step.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <p className="font-display text-3xl font-bold text-gradient">{step.num}</p>
                      <h3 className="section-title mt-1 text-sm text-ink">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
