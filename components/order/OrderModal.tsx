"use client";

/**
 * Global ORDER modal — one modal for every "BUYURTMA BERISH" button.
 * Glass, animated, bottom-sheet on mobile (max 92dvh), focus trap, Esc,
 * body scroll lock. Prefilled when opened from a card.
 *
 * States: idle → sending → success → error.
 * Success ONLY after the backend confirms Telegram accepted the message.
 * On failure all entered data is kept and clear fallbacks are offered.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRODUCTS, type ProductId } from "@/config/products";
import {
  CONTACT,
  DENSITY_VALUES,
  QUANTITY_MAX,
  QUANTITY_MIN,
  THICKNESS_CM,
  type DensityValue,
  type ThicknessValue,
} from "@/config/site";
import { useFocusTrap, useLockBodyScroll } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";
import { maskPhoneInput, normalizePhone } from "@/lib/normalize";
import { formatDensity, formatThickness, formatUsd, getQuantityUnit, getUnitPriceUsd } from "@/lib/pricing";
import { Icon } from "@/components/ui/Icons";
import { Spinner } from "@/components/ui/Spinner";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { OrderSummary } from "./OrderSummary";
import { cn } from "@/lib/utils";

type Phase = "idle" | "sending" | "success" | "error";

interface FormState {
  name: string;
  phone: string;
  productId: ProductId;
  density: DensityValue | null;
  thickness: ThicknessValue | null;
  quantity: number;
  note: string;
}

type Errors = Partial<Record<"name" | "phone" | "quantity" | "note" | "form", string>>;

export function OrderModal() {
  const { t, lang } = useI18n();
  const { isOpen, prefill, closeOrder } = useOrder();
  const panelRef = useRef<HTMLDivElement>(null);
  const submitLock = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    productId: "oq",
    density: 15,
    thickness: 10,
    quantity: 1,
    note: "",
  });

  useFocusTrap(panelRef, isOpen, closeOrder);
  useLockBodyScroll(isOpen);

  // Prefill from the source card / search result.
  useEffect(() => {
    if (!isOpen) return;
    setPhase("idle");
    setErrors({});
    setTouched({});
    setForm((f) => ({
      ...f,
      productId: prefill.productId ?? f.productId,
      density: prefill.density ?? (prefill.productId === "maydalangan" ? null : f.density ?? 15),
      thickness: prefill.thickness ?? (prefill.productId === "maydalangan" ? null : f.thickness ?? 10),
      quantity: prefill.quantity ?? f.quantity,
    }));
    submitLock.current = false;
  }, [isOpen, prefill]);

  const crushed = form.productId === "maydalangan";
  const unit = getQuantityUnit(form.productId);

  const validate = useCallback(
    (f: FormState): Errors => {
      const next: Errors = {};
      const name = f.name.trim();
      if (!name) next.name = t.validation.nameRequired;
      else if (name.length < 2) next.name = t.validation.nameMin;
      else if (name.length > 80) next.name = t.validation.nameMax;

      if (!f.phone.trim()) next.phone = t.validation.phoneRequired;
      else if (!normalizePhone(f.phone)) next.phone = t.validation.phoneInvalid;

      if (!Number.isInteger(f.quantity) || f.quantity < QUANTITY_MIN) next.quantity = t.validation.quantityInvalid;
      else if (f.quantity > QUANTITY_MAX) next.quantity = t.validation.quantityMax;

      if (f.note.length > 500) next.note = t.validation.noteMax;
      return next;
    },
    [t],
  );

  // Live validation (inline messages).
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    setErrors(validate(form));
  }, [form, touched, validate]);

  const isValid = Object.keys(validate(form)).length === 0;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onProductChange = (productId: ProductId) => {
    const isCrushed = productId === "maydalangan";
    setForm((f) => ({
      ...f,
      productId,
      density: isCrushed ? null : f.density ?? 15,
      thickness: isCrushed ? null : f.thickness ?? 10,
    }));
  };

  const summaryText = () => {
    const unitPrice = getUnitPriceUsd(form.productId, form.density);
    const total = unitPrice * form.quantity;
    const lines = [
      `${t.order.summary.product}: ${t.products.names[form.productId]}`,
    ];
    if (!crushed && form.density != null) lines.push(`${t.order.summary.density}: ${formatDensity(form.density)}`);
    if (!crushed && form.thickness != null) lines.push(`${t.order.summary.thickness}: ${formatThickness(form.thickness)}`);
    lines.push(`${t.order.summary.quantity}: ${form.quantity} ${unit}`);
    lines.push(`${t.order.summary.price}: ${crushed ? `${formatUsd(unitPrice)} / KG` : formatUsd(unitPrice)}`);
    lines.push(`${t.order.summary.total}: ${formatUsd(total)}`);
    lines.push(`${t.order.name}: ${form.name.trim()}`);
    lines.push(`${t.order.phone}: ${form.phone.trim()}`);
    if (form.note.trim()) lines.push(`${t.order.note}: ${form.note.trim()}`);
    return lines.join("\n");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitLock.current) return;

    const validation = validate(form);
    setTouched({ name: true, phone: true, quantity: true, note: true });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    submitLock.current = true;
    setPhase("sending");
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          productId: form.productId,
          density: crushed ? null : form.density,
          thickness: crushed ? null : form.thickness,
          quantity: form.quantity,
          note: form.note.trim() || undefined,
          lang,
        }),
        signal: AbortSignal.timeout(12_000),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (response.ok && data?.ok === true) {
        setPhase("success");
      } else {
        setPhase("error");
      }
    } catch {
      setPhase("error");
    } finally {
      submitLock.current = false;
    }
  };

  const resetAndClose = () => {
    setForm({ name: "", phone: "", productId: "oq", density: 15, thickness: 10, quantity: 1, note: "" });
    setPhase("idle");
    setErrors({});
    setTouched({});
    closeOrder();
  };

  const fieldClass = (hasError: boolean) =>
    cn(
      "glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted",
      hasError && "!border-red-400/70",
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label={t.order.close}
            onClick={closeOrder}
            className="absolute inset-0 cursor-default bg-[rgba(2,8,20,0.65)] backdrop-blur-md"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.order.title}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-card sm:rounded-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-glass-border px-6 py-5">
              <h2 className="section-title text-lg text-ink">{t.order.title}</h2>
              <button
                type="button"
                onClick={closeOrder}
                aria-label={t.order.close}
                className="glass-soft btn h-10 w-10 !p-0 text-ink-muted hover:text-ink"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain">
              {/* ---------- SUCCESS ---------- */}
              {phase === "success" && (
                <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-soft text-cyan"
                  >
                    <Icon name="check" className="h-10 w-10" strokeWidth={2.4} />
                  </motion.span>
                  <h3 className="max-w-sm text-lg font-bold leading-relaxed text-ink">{t.order.successTitle}</h3>
                  <div className="w-full max-w-sm text-left">
                    <OrderSummary
                      state={{
                        productId: form.productId,
                        density: form.density,
                        thickness: form.thickness,
                        quantity: form.quantity,
                      }}
                    />
                  </div>
                  <button type="button" onClick={resetAndClose} className="btn-primary mt-2 px-8 py-4 text-sm">
                    {t.order.close}
                  </button>
                </div>
              )}

              {/* ---------- ERROR ---------- */}
              {phase === "error" && (
                <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                    <Icon name="alert" className="h-10 w-10" />
                  </span>
                  <h3 className="max-w-md text-base font-bold leading-relaxed text-ink">{t.order.errorTitle}</h3>
                  <div className="flex w-full max-w-sm flex-col gap-2">
                    <button type="button" onClick={() => setPhase("idle")} className="btn-primary w-full py-4 text-sm">
                      {t.order.retry}
                    </button>
                    <a
                      href={`${CONTACT.telegramUrl}?text=${encodeURIComponent(`${t.order.title}\n\n${summaryText()}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost w-full py-4 text-sm"
                    >
                      <Icon name="telegram" className="h-4 w-4 text-cyan" />
                      {t.order.telegramFallback}
                    </a>
                  </div>
                </div>
              )}

              {/* ---------- FORM ---------- */}
              {(phase === "idle" || phase === "sending") && (
                <form onSubmit={onSubmit} noValidate className="grid gap-5 p-6 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-4">
                    {/* ISM */}
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                        {t.order.name} *
                      </span>
                      <input
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        onBlur={() => setTouched((x) => ({ ...x, name: true }))}
                        placeholder={t.order.namePlaceholder}
                        maxLength={80}
                        className={fieldClass(Boolean(errors.name))}
                        aria-invalid={Boolean(errors.name)}
                      />
                      {touched.name && errors.name && <span className="mt-1.5 block text-xs text-red-400">{errors.name}</span>}
                    </label>

                    {/* TELEFON RAQAMI */}
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                        {t.order.phone} *
                      </span>
                      <input
                        value={form.phone}
                        onChange={(e) => setField("phone", maskPhoneInput(e.target.value))}
                        onBlur={() => setTouched((x) => ({ ...x, phone: true }))}
                        placeholder={t.order.phonePlaceholder}
                        inputMode="tel"
                        autoComplete="tel"
                        className={fieldClass(Boolean(errors.phone))}
                        aria-invalid={Boolean(errors.phone)}
                      />
                      {touched.phone && errors.phone && (
                        <span className="mt-1.5 block text-xs text-red-400">{errors.phone}</span>
                      )}
                    </label>

                    {/* MAHSULOT */}
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                        {t.order.product}
                      </span>
                      <select
                        value={form.productId}
                        onChange={(e) => onProductChange(e.target.value as ProductId)}
                        className={cn(fieldClass(false), "appearance-none")}
                      >
                        {PRODUCTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {t.products.names[p.id]}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* ZICHLIGI / PLOTNOST */}
                    {!crushed && (
                      <div>
                        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                          {t.order.density}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {DENSITY_VALUES.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setField("density", d)}
                              aria-pressed={form.density === d}
                              className={cn("chip", form.density === d && "chip-active")}
                            >
                              {formatDensity(d)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* QALINLIGI */}
                    {!crushed && (
                      <div>
                        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                          {t.order.thickness}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {THICKNESS_CM.map((th) => (
                            <button
                              key={th}
                              type="button"
                              onClick={() => setField("thickness", th)}
                              aria-pressed={form.thickness === th}
                              className={cn("chip", form.thickness === th && "chip-active")}
                            >
                              {formatThickness(th)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MIQDORI */}
                    <div>
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                        {t.order.quantity} *
                      </span>
                      <QuantityStepper
                        value={form.quantity}
                        onChange={(v) => setField("quantity", v)}
                        min={QUANTITY_MIN}
                        max={QUANTITY_MAX}
                        unit={unit}
                      />
                      {touched.quantity && errors.quantity && (
                        <span className="mt-1.5 block text-xs text-red-400">{errors.quantity}</span>
                      )}
                    </div>

                    {/* IZOH */}
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                        {t.order.note}
                      </span>
                      <textarea
                        value={form.note}
                        onChange={(e) => setField("note", e.target.value.slice(0, 500))}
                        onBlur={() => setTouched((x) => ({ ...x, note: true }))}
                        placeholder={t.order.notePlaceholder}
                        rows={3}
                        maxLength={500}
                        className={cn(fieldClass(Boolean(errors.note)), "resize-none")}
                      />
                      <span className="mt-1 block text-right text-[10px] text-ink-muted">{form.note.length}/500</span>
                    </label>
                  </div>

                  {/* Summary panel */}
                  <div className="space-y-4">
                    <OrderSummary
                      state={{
                        productId: form.productId,
                        density: form.density,
                        thickness: form.thickness,
                        quantity: form.quantity,
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!isValid || phase === "sending"}
                      className="btn-primary w-full py-4 text-sm"
                    >
                      {phase === "sending" ? (
                        <>
                          <Spinner />
                          {t.order.sending}
                        </>
                      ) : (
                        t.order.submit
                      )}
                    </button>
                    <a
                      href={`${CONTACT.telegramUrl}?text=${encodeURIComponent(`${t.order.title}\n\n${summaryText()}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost w-full py-3.5 text-xs"
                    >
                      <Icon name="telegram" className="h-4 w-4 text-cyan" />
                      {t.order.telegramFallback}
                    </a>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
