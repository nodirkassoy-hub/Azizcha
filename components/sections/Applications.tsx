"use client";

/**
 * QAYERDA ISHLATILADI? — 7 items in a bento glass grid (desktop)
 * and a 2-column grid (mobile).
 */

import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const APPLICATION_KEYS_ORDER = ["uy", "binolar", "devor", "tom", "pol", "sovutish", "qadoqlash"] as const;
export type ApplicationKey = (typeof APPLICATION_KEYS_ORDER)[number];

const ICONS: Record<ApplicationKey, IconName> = {
  uy: "home",
  binolar: "building",
  devor: "wall",
  tom: "roof",
  pol: "floor",
  sovutish: "snow",
  qadoqlash: "package",
};

/** Bento span pattern on lg screens (7 tiles). */
const SPANS: Record<ApplicationKey, string> = {
  uy: "lg:col-span-2 lg:row-span-2",
  binolar: "lg:col-span-2",
  devor: "lg:col-span-1",
  tom: "lg:col-span-1",
  pol: "lg:col-span-2",
  sovutish: "lg:col-span-1",
  qadoqlash: "lg:col-span-1",
};

export function Applications() {
  const { t } = useI18n();

  return (
    <section id="qayerda-ishlatiladi" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">EPS</span>
          <h2 className="section-title mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">{t.applications.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{t.applications.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {APPLICATION_KEYS_ORDER.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className={cn(
                "glass group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-card p-5 transition-all duration-500 hover:glow-ring sm:min-h-[180px]",
                SPANS[key],
                key === "uy" && "col-span-2",
              )}
            >
              <span className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-cyan transition-transform duration-500 group-hover:scale-110">
                <Icon name={ICONS[key]} className="h-5 w-5" />
              </span>
              <h3 className={cn("section-title mt-6 text-sm leading-snug text-ink sm:text-base", key === "uy" && "text-lg sm:text-xl")}>
                {t.applications.items[key]}
              </h3>
              {/* blueprint hint */}
              <div className="grid-blueprint pointer-events-none absolute inset-0 opacity-40" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
