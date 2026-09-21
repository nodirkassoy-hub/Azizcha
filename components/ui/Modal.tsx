"use client";

/**
 * Accessible glass modal: overlay + focus trap + Esc + body scroll lock.
 * Bottom-sheet style on mobile (max-height 92dvh, internal scroll).
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, type ReactNode } from "react";
import { useFocusTrap, useLockBodyScroll } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Icon } from "./Icons";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Hide the default header (custom header inside children). */
  hideHeader?: boolean;
  className?: string;
}

export function Modal({ open, onClose, title, children, hideHeader, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onEscape = useCallback(() => onClose(), [onClose]);
  useFocusTrap(panelRef, open, onEscape);
  useLockBodyScroll(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button
            type="button"
            aria-label="close"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[rgba(2,8,20,0.6)] backdrop-blur-md"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "glass-strong relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-card sm:rounded-card",
              className,
            )}
          >
            {!hideHeader && (
              <div className="flex items-center justify-between gap-4 border-b border-glass-border px-6 py-5">
                <h2 className="section-title text-lg text-ink">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={title}
                  className="glass-soft btn h-10 w-10 !p-0 text-ink-muted hover:text-ink"
                >
                  <Icon name="close" />
                </button>
              </div>
            )}
            <div className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
