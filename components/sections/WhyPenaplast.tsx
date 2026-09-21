"use client";

/**
 * NEGA PENAPLAST? — six glass cards with line icons.
 */

import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";

export function WhyPenaplast() {
  const { t } = useI18n();

  return (
    <section id="nega-penaplast" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">EPS</span>
          <h2 className="section-title mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">{t.why.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{t.why.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.why.cards.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
              className="glass group rounded-card p-7 transition-all duration-500 hover:-translate-y-1.5 hover:glow-ring"
            >
              <span className="glass-soft flex h-12 w-12 items-center justify-center rounded-2xl text-cyan transition-transform duration-500 group-hover:scale-110">
                <Icon name={card.icon as IconName} className="h-6 w-6" />
              </span>
              <h3 className="section-title mt-5 text-sm leading-snug text-ink">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{card.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
