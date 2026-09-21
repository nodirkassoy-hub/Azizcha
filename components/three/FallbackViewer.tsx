"use client";

/**
 * WebGL-unavailable fallback: static realistic image with pan/zoom.
 */

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function FallbackViewer({ note }: { note: string }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden rounded-card bg-[#050b14]")}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, ox: transform.x, oy: transform.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setTransform((t) => ({
          ...t,
          x: drag.current!.ox + (e.clientX - drag.current!.x),
          y: drag.current!.oy + (e.clientY - drag.current!.y),
        }));
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onWheel={(e) => {
        setTransform((t) => ({
          ...t,
          scale: Math.min(2.5, Math.max(1, t.scale - e.deltaY * 0.0015)),
        }));
      }}
      onDoubleClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
    >
      <Image
        src="/images/3d-fallback.jpg"
        alt={note}
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover transition-transform duration-75"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      />
      <p className="glass absolute bottom-4 left-4 rounded-full px-4 py-2 text-xs text-ink">{note}</p>
    </div>
  );
}
