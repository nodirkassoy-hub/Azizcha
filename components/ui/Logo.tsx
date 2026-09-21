"use client";

/**
 * IZO PLUS — PENAPLAST ZAVODI logo lockup (geometric heavy sans, font-independent paths).
 * Dark variant: white "IZO" + cyan→blue gradient "PLUS".
 * Light variant: dark navy "IZO" + cyan/blue gradient "PLUS".
 */

import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface GlyphProps {
  x: number;
  stroke: string;
}

/** Glyph centerlines, cap-height 72, stroke 16, round caps. */
function GlyphI({ x, stroke }: GlyphProps) {
  return <path d={`M${x + 8},8 V64`} stroke={stroke} />;
}
function GlyphZ({ x, stroke }: GlyphProps) {
  return <path d={`M${x + 8},8 H${x + 48} L${x + 8},64 H${x + 48}`} stroke={stroke} />;
}
function GlyphO({ x, stroke }: GlyphProps) {
  return <ellipse cx={x + 29} cy={36} rx={21} ry={28} stroke={stroke} />;
}
function GlyphP({ x, stroke }: GlyphProps) {
  return <path d={`M${x + 8},64 V8 H${x + 30} A14,14 0 0 1 ${x + 30},36 H${x + 8}`} stroke={stroke} />;
}
function GlyphL({ x, stroke }: GlyphProps) {
  return <path d={`M${x + 8},8 V56 H${x + 40}`} stroke={stroke} />;
}
function GlyphU({ x, stroke }: GlyphProps) {
  return <path d={`M${x + 8},8 V42 A21,21 0 0 0 ${x + 50},42 V8`} stroke={stroke} />;
}
function GlyphS({ x, stroke }: GlyphProps) {
  return (
    <path
      d={`M${x + 42},15 C${x + 38},8 ${x + 33},5 ${x + 27},5 C${x + 17},5 ${x + 11},10 ${x + 11},18 C${x + 11},25 ${x + 17},28 ${x + 28},30 C${x + 39},32 ${x + 44},37 ${x + 44},47 C${x + 44},58 ${x + 35},66 ${x + 25},66 C${x + 17},66 ${x + 10},62 ${x + 7},55`}
      stroke={stroke}
    />
  );
}

const TRACK = 10;

export interface LogoProps {
  /** Force variant; default follows the theme. */
  variant?: "dark" | "light" | "auto";
  className?: string;
  /** Hide the "PENAPLAST ZAVODI" tagline (e.g. in tiny contexts). */
  hideTagline?: boolean;
}

export function Logo({ variant = "auto", className, hideTagline = false }: LogoProps) {
  const { theme } = useTheme();
  const resolved = variant === "auto" ? theme : variant;
  const isDark = resolved === "dark";
  const white = isDark ? "#FFFFFF" : "#0B1E3A";
  const tagline = isDark ? "#8FA3BA" : "#4A6484";
  const gradFrom = isDark ? "#22D3EE" : "#0891B2";
  const gradTo = isDark ? "#3B82F6" : "#2563EB";
  const gradId = isDark ? "izoGradDark" : "izoGradLight";

  // Layout: I Z O  [space]  P L U S
  const iX = 0;
  const zX = iX + 16 + TRACK;
  const oX = zX + 56 + TRACK;
  const pX = oX + 58 + TRACK + 14;
  const lX = pX + 52 + TRACK;
  const uX = lX + 48 + TRACK;
  const sX = uX + 58 + TRACK;
  const totalWidth = sX + 50;

  return (
    <svg
      viewBox={`-8 -8 ${totalWidth + 16} ${hideTagline ? 96 : 132}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="IZO PLUS — PENAPLAST ZAVODI"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={gradFrom} />
          <stop offset="1" stopColor={gradTo} />
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round">
        <GlyphI x={iX} stroke={white} />
        <GlyphZ x={zX} stroke={white} />
        <GlyphO x={oX} stroke={white} />
        <GlyphP x={pX} stroke={`url(#${gradId})`} />
        <GlyphL x={lX} stroke={`url(#${gradId})`} />
        <GlyphU x={uX} stroke={`url(#${gradId})`} />
        <GlyphS x={sX} stroke={`url(#${gradId})`} />
      </g>
      {!hideTagline && (
        <text
          x={2}
          y={104}
          fill={tagline}
          fontFamily="Manrope, Inter, 'Segoe UI', Arial, sans-serif"
          fontSize={13}
          fontWeight={600}
          letterSpacing={5.4}
        >
          PENAPLAST ZAVODI
        </text>
      )}
    </svg>
  );
}
