"use client";

/**
 * Global order-modal state. Every "BUYURTMA BERISH" button opens the same modal,
 * optionally prefilled with a product selection.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ProductId } from "@/config/products";
import type { DensityValue, ThicknessValue } from "@/config/site";

export interface OrderPrefill {
  productId?: ProductId;
  density?: DensityValue;
  thickness?: ThicknessValue;
  quantity?: number;
}

interface OrderContextValue {
  isOpen: boolean;
  prefill: OrderPrefill;
  openOrder: (prefill?: OrderPrefill) => void;
  closeOrder: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<OrderPrefill>({});

  const openOrder = useCallback((next?: OrderPrefill) => {
    setPrefill(next ?? {});
    setOpen(true);
  }, []);
  const closeOrder = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ isOpen, prefill, openOrder, closeOrder }), [isOpen, prefill, openOrder, closeOrder]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
