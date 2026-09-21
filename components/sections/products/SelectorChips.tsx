"use client";

/**
 * Product selector chips (density / thickness) — large tap targets on mobile.
 */

import type { DensityValue, ThicknessValue } from "@/config/site";
import { formatDensity, formatThickness } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function SelectorChips<T extends DensityValue | ThicknessValue>({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format: (v: T) => string;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={cn("chip", value === opt && "chip-active")}
          >
            {format(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DensityChips(props: {
  label: string;
  options: readonly DensityValue[];
  value: DensityValue;
  onChange: (v: DensityValue) => void;
}) {
  return <SelectorChips {...props} format={formatDensity} />;
}

export function ThicknessChips(props: {
  label: string;
  options: readonly ThicknessValue[];
  value: ThicknessValue;
  onChange: (v: ThicknessValue) => void;
}) {
  return <SelectorChips {...props} format={formatThickness} />;
}
