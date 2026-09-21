"use client";

/**
 * Footer: logo + tagline, section links, phone, Telegram, © year IZO PLUS.
 */

import { CONTACT } from "@/config/site";
import { Icon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";

const LINKS = [
  { id: "mahsulotlar", key: "products" },
  { id: "3d-tajriba", key: "threeD" },
  { id: "ishlab-chiqarish", key: "production" },
  { id: "nega-penaplast", key: "why" },
  { id: "qayerda-ishlatiladi", key: "applications" },
  { id: "biz-haqimizda", key: "about" },
  { id: "aloqa", key: "contact" },
] as const;

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-glass-border pb-28 pt-14 md:pb-14">
      <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 md:grid-cols-3">
        <div>
          <Logo className="h-12 w-[150px]" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">{t.hero.description}</p>
        </div>

        <nav aria-label={t.footer.navLabel} className="grid grid-cols-2 gap-2 text-sm">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="py-1.5 text-ink-muted transition-colors hover:text-ink">
              {t.nav[l.key]}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-start gap-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-muted">{t.footer.contactLabel}</p>
          <a href={CONTACT.phoneTel} className="flex items-center gap-2 text-ink transition-colors hover:text-cyan">
            <Icon name="phone" className="h-4 w-4 text-cyan" />
            {CONTACT.phoneDisplay}
          </a>
          <a
            href={CONTACT.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink transition-colors hover:text-cyan"
          >
            <Icon name="telegram" className="h-4 w-4 text-cyan" />
            @{CONTACT.telegramUser}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-content border-t border-glass-border px-4 pt-6 text-center text-xs uppercase tracking-[0.25em] text-ink-muted sm:px-6">
        {t.footer.rights(year)}
      </div>
    </footer>
  );
}
