import type { ReactNode } from "react";

interface TooltipProps {
  x: string;
  y: string;
  children: ReactNode;
}

export function Tooltip({ x, y, children }: TooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full border border-rule bg-surface px-3 py-2"
      style={{
        // Clamp the anchor point so the (horizontally centered) tooltip can't
        // get clipped off-screen near the chart's left/right edges.
        left: `clamp(90px, ${x}, calc(100% - 90px))`,
        top: `calc(${y} - 14px)`,
      }}
    >
      {children}
    </div>
  );
}
