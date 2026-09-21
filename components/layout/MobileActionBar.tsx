"use client";

/**
 * Mobile sticky action bar (<768px): Qo‘ng‘iroq + Buyurtma.
 * Hidden while the order modal is open; page footer gets bottom padding.
 */

import { CONTACT } from "@/config/site";
import { Icon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { useOrder } from "@/lib/order-context";

export function MobileActionBar() {
  const { t } = useI18n();
  const { openOrder, isOpen } = useOrder();

  return (
    <div
      className={`glass-strong fixed inset-x-3 bottom-3 z-[60] flex items-center gap-2 rounded-full p-2 transition-all duration-300 md:hidden ${
        isOpen ? "pointer-events-none translate-y-24 opacity-0" : "opacity-100"
      }`}
    >
      <a href={CONTACT.phoneTel} className="btn-ghost flex-1 py-3 text-sm font-bold">
        <Icon name="phone" className="h-4 w-4 text-cyan" />
        {t.nav.call}
      </a>
      <button type="button" onClick={() => openOrder()} className="btn-primary flex-1 py-3 text-sm font-bold">
        {t.nav.orderShort}
      </button>
    </div>
  );
}
