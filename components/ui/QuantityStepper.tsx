"use client";

/**
 * Numeric quantity stepper (− / input / +) with large tap targets.
 */

import { Icon } from "./Icons";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
  id?: string;
  disabled?: boolean;
}

export function QuantityStepper({ value, onChange, min, max, unit, id, disabled }: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className={cn("flex items-stretch gap-2", disabled && "opacity-50")}>
      <button
        type="button"
        aria-label="-"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="glass-soft btn h-11 w-11 !p-0 text-ink hover:border-cyan/60 disabled:opacity-40"
      >
        <Icon name="minus" />
      </button>
      <div className="glass-soft flex min-w-0 flex-1 items-center rounded-full px-4">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ""}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) onChange(min);
            else onChange(Math.min(max, Math.max(0, Math.floor(n))));
          }}
          className="w-full min-w-0 bg-transparent text-center text-base font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="ml-2 shrink-0 text-sm text-ink-muted">{unit}</span>
      </div>
      <button
        type="button"
        aria-label="+"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="glass-soft btn h-11 w-11 !p-0 text-ink hover:border-cyan/60 disabled:opacity-40"
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
