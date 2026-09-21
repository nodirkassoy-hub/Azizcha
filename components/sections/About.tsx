"use client";

/**
 * BIZ HAQIMIZDA — glass split layout: factory image + real-fact chips.
 * Only verified facts; editable extra paragraph via ABOUT_EXTRA in config/site.ts.
 */

import { motion } from "framer-motion";
import Image from "next/image";
import { ABOUT_EXTRA } from "@/config/site";
import { useI18n } from "@/lib/i18n";

export function About() {
  const { t } = useI18n();

  return (
    <section id="biz-haqimizda" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">IZO PLUS</span>
          <h2 className="section-title mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">{t.about.title}</h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan">{t.about.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="glass relative min-h-[320px] overflow-hidden rounded-card"
          >
            <Image
              src="/images/about-factory.jpg"
              alt={t.about.subtitle}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,10,20,0.6)] via-transparent to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="glass flex flex-col justify-center gap-4 rounded-card p-8"
          >
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-ink-muted sm:text-base">
                {paragraph}
              </p>
            ))}
            {ABOUT_EXTRA && <p className="text-sm leading-relaxed text-ink-muted sm:text-base">{ABOUT_EXTRA}</p>}

            {/* Real-fact chips */}
            <div className="mt-4 flex flex-wrap gap-3">
              {[t.about.chipProducts, t.about.chipDensity, t.about.chipThickness].map((chip) => (
                <span key={chip} className="glass-soft rounded-full px-5 py-2.5 text-sm font-bold text-ink">
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
