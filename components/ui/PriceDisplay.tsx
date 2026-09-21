"use client";

/**
 * Live price display with a fade/slide transition when the value changes.
 */

import { AnimatePresence, motion } from "framer-motion";

export function PriceDisplay({
  value,
  suffix,
  className,
  size = "lg",
}: {
  value: string;
  suffix?: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={
            size === "lg"
              ? "inline-block font-display text-3xl font-bold text-gradient"
              : "inline-block font-display text-xl font-bold text-gradient"
          }
        >
          {value}
        </motion.span>
      </AnimatePresence>
      {suffix ? <span className="ml-2 text-sm font-semibold text-ink-muted">{suffix}</span> : null}
    </span>
  );
}
