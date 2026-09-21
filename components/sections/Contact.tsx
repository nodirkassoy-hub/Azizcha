"use client";

/**
 * ALOQA — phone card (tel:), Telegram card (new tab, noopener noreferrer),
 * big order CTA. Optional address/email render only when set in config.
 */

import { motion } from "framer-motion";
import { CONTACT, CONTACT_OPTIONAL } from "@/config/site";
import { Icon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";

export function Contact() {
  const { t } = useI18n();
  const { openOrder } = useOrder();
  const hasAddress = CONTACT_OPTIONAL.address.length > 0;
  const hasEmail = CONTACT_OPTIONAL.email.length > 0;

  return (
    <section id="aloqa" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">IZO PLUS</span>
          <h2 className="section-title mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">{t.contact.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{t.contact.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {/* Phone */}
          <motion.a
            href={CONTACT.phoneTel}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="glass group flex items-center gap-5 rounded-card p-7 transition-all duration-500 hover:glow-ring"
          >
            <span className="glass-soft flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-cyan transition-transform duration-500 group-hover:scale-110">
              <Icon name="phone" className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">{t.contact.phoneLabel}</span>
              <span className="mt-1 block font-display text-xl font-bold text-ink sm:text-2xl">{CONTACT.phoneDisplay}</span>
              <span className="mt-1 block text-xs text-ink-muted">{t.contact.phoneHint}</span>
            </span>
          </motion.a>

          {/* Telegram */}
          <motion.a
            href={CONTACT.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: 0.07 }}
            className="glass group flex items-center gap-5 rounded-card p-7 transition-all duration-500 hover:glow-ring"
          >
            <span className="glass-soft flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-cyan transition-transform duration-500 group-hover:scale-110">
              <Icon name="telegram" className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">{t.contact.telegramLabel}</span>
              <span className="mt-1 block font-display text-xl font-bold text-ink sm:text-2xl">@{CONTACT.telegramUser}</span>
              <span className="mt-1 block text-xs text-ink-muted">{t.contact.telegramHint}</span>
            </span>
          </motion.a>

          {(hasAddress || hasEmail) && (
            <div className="glass rounded-card p-7 md:col-span-2">
              {hasAddress && <p className="text-sm text-ink-muted">{CONTACT_OPTIONAL.address}</p>}
              {hasEmail && <p className="text-sm text-ink-muted">{CONTACT_OPTIONAL.email}</p>}
            </div>
          )}
        </div>

        {/* Big CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-strong mt-6 flex flex-col items-center gap-4 rounded-card px-6 py-12 text-center"
        >
          <p className="max-w-md text-sm text-ink-muted">{t.contact.orderCtaHint}</p>
          <button type="button" onClick={() => openOrder()} className="btn-primary px-10 py-5 text-sm">
            {t.contact.orderCta}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
