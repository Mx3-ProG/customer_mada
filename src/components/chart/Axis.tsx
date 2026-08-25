interface AxisProps {
  scale: (v: number) => number;
  ticks: number[];
  y: number;
  format?: (v: number) => string;
}

/** Axe discret : pas de ligne, pas de grille, labels mono flottants. */
export function Axis({ scale, ticks, y, format = String }: AxisProps) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <text
          key={t}
          x={scale(t)}
          y={y}
          textAnchor="middle"
          className="fill-ink-faint font-mono text-[11px]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {format(t)}
        </text>
      ))}
    </g>
  );
}
