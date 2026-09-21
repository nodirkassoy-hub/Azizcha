/**
 * Consistent line-icon set (24×24, stroke-based).
 */

import { cn } from "@/lib/utils";

export type IconName =
  | "search"
  | "sun"
  | "moon"
  | "phone"
  | "telegram"
  | "menu"
  | "close"
  | "arrow-down"
  | "arrow-up"
  | "plus"
  | "minus"
  | "reset"
  | "rotate"
  | "shield"
  | "gauge"
  | "layers"
  | "thermometer"
  | "factory"
  | "truck"
  | "home"
  | "building"
  | "wall"
  | "roof"
  | "floor"
  | "snow"
  | "package"
  | "check"
  | "alert"
  | "cube"
  | "zoom-in"
  | "zoom-out";

const PATHS: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </>
  ),
  moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />,
  phone: (
    <path d="M5 4h3.2l1.6 4-2 1.4a12.5 12.5 0 0 0 5.8 5.8l1.4-2 4 1.6V18a2 2 0 0 1-2.2 2A15.8 15.8 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  ),
  telegram: (
    <>
      <path d="M21 4 3 11l5.5 2L18 7l-7 8.5V20l3.2-3.6L19 20Z" />
      <path d="m8.5 13 2 5.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  "arrow-down": <path d="M12 4v14m0 0-5-5m5 5 5-5" />,
  "arrow-up": <path d="M12 20V6m0 0-5 5m5-5 5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  reset: (
    <>
      <path d="M4 10a8 8 0 1 1 2.3 6" />
      <path d="M4 4v6h6" />
    </>
  ),
  rotate: (
    <>
      <path d="M12 4a8 8 0 0 1 7.4 5" />
      <path d="M20 5v5h-5" />
      <path d="M12 20a8 8 0 0 1-7.4-5" />
      <path d="M4 19v-5h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.4 3 7.6 7 9.5 4-1.9 7-5.1 7-9.5V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  gauge: (
    <>
      <path d="M5.5 18a8.5 8.5 0 1 1 13 0" />
      <path d="M12 13.5 15.5 10" />
      <circle cx="12" cy="14" r="1.4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 4 8 4.5-8 4.5-8-4.5Z" />
      <path d="m4 13 8 4.5L20 13" />
    </>
  ),
  thermometer: (
    <>
      <path d="M10 13.5V6a2 2 0 1 1 4 0v7.5a4.5 4.5 0 1 1-4 0Z" />
      <path d="M12 9v6" />
    </>
  ),
  factory: (
    <>
      <path d="M4 20V9l5 3V9l5 3V6.5h2.2L20 10v10Z" />
      <path d="M8 20v-4h3v4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h10v9H3Z" />
      <path d="M13 10h4.2l2.8 3.2V16h-7" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="16.5" cy="18" r="1.8" />
    </>
  ),
  home: (
    <>
      <path d="m4 11 8-7 8 7" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  building: (
    <>
      <path d="M5 20V5h10v15" />
      <path d="M15 10h4v10" />
      <path d="M8 8h4M8 12h4M8 16h4" />
    </>
  ),
  wall: (
    <>
      <path d="M4 6h16v12H4Z" />
      <path d="M4 12h16M9 6v6M15 12v6M15 6v3M9 15v3" />
    </>
  ),
  roof: (
    <>
      <path d="m3 12 9-7 9 7" />
      <path d="M6 12v7h12v-7" />
      <path d="M12 5v-2" />
    </>
  ),
  floor: (
    <>
      <path d="M3 16h18" />
      <path d="M5 16 8 9h8l3 7" />
      <path d="M3 20h18" />
    </>
  ),
  snow: (
    <>
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
      <path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2" />
    </>
  ),
  package: (
    <>
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5Z" />
      <path d="m4 8.5 8 4.5 8-4.5M12 13v7" />
    </>
  ),
  check: <path d="m5 13 4.5 4.5L19 7" />,
  alert: (
    <>
      <path d="M12 4 3 20h18Z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  cube: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  "zoom-in": (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2M11 8.5v5M8.5 11h5" />
    </>
  ),
  "zoom-out": (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2M8.5 11h5" />
    </>
  ),
};

export interface IconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
