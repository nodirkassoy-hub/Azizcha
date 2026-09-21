"use client";

/**
 * Sticky glass navbar + mobile drawer + search overlay + language & theme controls.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { Icon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { LANGS, type SiteLang } from "@/content";
import { useEscape, useFocusTrap, useLockBodyScroll } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";
import { useTheme } from "@/lib/theme";
import { CONTACT } from "@/config/site";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "mahsulotlar", key: "products" },
  { id: "3d-tajriba", key: "threeD" },
  { id: "ishlab-chiqarish", key: "production" },
  { id: "nega-penaplast", key: "why" },
  { id: "qayerda-ishlatiladi", key: "applications" },
  { id: "biz-haqimizda", key: "about" },
  { id: "aloqa", key: "contact" },
] as const;

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { openOrder } = useOrder();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // Active-section highlight
      let current = "";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom > 140) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  useFocusTrap(drawerRef, drawerOpen, closeDrawer);
  useLockBodyScroll(drawerOpen);
  useEscape(searchOpen, () => setSearchOpen(false));

  const navLabel = (key: (typeof SECTIONS)[number]["key"]) => t.nav[key] as string;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-all duration-500 ease-soft",
          scrolled ? "glass-strong py-2" : "bg-transparent py-4",
        )}
      >
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#bosh" className="flex shrink-0 items-center gap-3" aria-label="IZO PLUS">
            <Logo className="h-11 w-[132px]" />
          </a>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Sections">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300",
                  active === s.id ? "bg-cyan-soft text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {navLabel(s.key)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t.nav.search}
              onClick={() => setSearchOpen(true)}
              className="glass-soft btn h-10 w-10 !p-0 text-ink-muted hover:text-ink"
            >
              <Icon name="search" />
            </button>

            <div className="glass-soft hidden items-center rounded-full p-1 sm:flex" role="group" aria-label={t.nav.language}>
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLang(l.id as SiteLang)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold tracking-wider transition-colors",
                    lang === l.id ? "bg-cyan-soft text-cyan" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-label={t.nav.theme}
              onClick={toggleTheme}
              className="glass-soft btn h-10 w-10 !p-0 text-ink-muted hover:text-ink"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>

            <button type="button" onClick={() => openOrder()} className="btn-primary hidden px-5 py-2.5 text-sm lg:inline-flex">
              {t.nav.order}
            </button>

            <button
              type="button"
              aria-label={t.nav.openMenu}
              onClick={() => setDrawerOpen(true)}
              className="glass-soft btn h-10 w-10 !p-0 text-ink xl:hidden"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[90] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label={t.nav.closeMenu}
              onClick={closeDrawer}
              className="absolute inset-0 cursor-default bg-[rgba(2,8,20,0.65)] backdrop-blur-md"
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.openMenu}
              tabIndex={-1}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong scrollbar-thin absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto rounded-l-card p-6"
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo className="h-10 w-[120px]" />
                <button type="button" aria-label={t.nav.closeMenu} onClick={closeDrawer} className="glass-soft btn h-10 w-10 !p-0">
                  <Icon name="close" />
                </button>
              </div>

              <nav className="flex flex-col gap-2" aria-label="Sections">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={closeDrawer}
                    className={cn(
                      "rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors",
                      active === s.id ? "bg-cyan-soft text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {navLabel(s.key)}
                  </a>
                ))}
              </nav>

              <div className="mt-8 space-y-4">
                <div className="glass-soft flex items-center justify-between rounded-full p-1" role="group" aria-label={t.nav.language}>
                  {LANGS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLang(l.id as SiteLang)}
                      className={cn(
                        "flex-1 rounded-full py-2 text-sm font-bold tracking-wider",
                        lang === l.id ? "bg-cyan-soft text-cyan" : "text-ink-muted",
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={toggleTheme} className="glass-soft btn flex-1 py-3 text-sm text-ink">
                    <Icon name={theme === "dark" ? "sun" : "moon"} />
                    {t.nav.theme}
                  </button>
                  <a href={CONTACT.phoneTel} className="glass-soft btn flex-1 py-3 text-sm text-ink">
                    <Icon name="phone" />
                    {t.nav.call}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    openOrder();
                  }}
                  className="btn-primary w-full py-4 text-sm"
                >
                  {t.nav.order}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
