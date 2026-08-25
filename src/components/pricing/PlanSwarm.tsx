import { useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { useBeeswarmLayout, type BeeswarmInput } from "@/hooks/useBeeswarmLayout";
import { DEFAULT_SETTINGS, healthColor } from "@/lib/clients";
import { useI18n } from "@/i18n";

const WIDTH = 1080;
const MARGIN = { top: 24, right: 48, bottom: 24, left: 48 };
const BAND = 150;
const HEIGHT = MARGIN.top + BAND + MARGIN.bottom;

/** Deterministic pseudo-random so server and client render the same swarm. */
function seeded(i: number) {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

const DOTS = Array.from({ length: 52 }, (_, i) => {
  const a = seeded(i);
  const b = seeded(i + 97);
  // Skew toward healthy scores so the decorative swarm feels optimistic.
  const score = Math.round(12 + a * a * 30 + b * 58);
  return { id: `d${i}`, score: Math.min(99, score), r: 5 + b * 11 };
});

/** Decorative 3D beeswarm — same visual language as the client flow chart. */
export function PlanSwarm() {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 46, z: -7 });

  const innerW = WIDTH - MARGIN.left - MARGIN.right;
  const x = useMemo(
    () =>
      scaleLinear()
        .domain([0, 100])
        .range([MARGIN.left, MARGIN.left + innerW]),
    [innerW],
  );

  const input = useMemo<BeeswarmInput[]>(
    () =>
      DOTS.map((d) => ({
        id: d.id,
        x: x(d.score),
        y: MARGIN.top + BAND / 2,
        r: d.r,
        yMin: MARGIN.top,
        yMax: MARGIN.top + BAND,
      })),
    [x],
  );

  const nodes = useBeeswarmLayout(input, WIDTH);
  const byId = useMemo(() => new Map(DOTS.map((d) => [d.id, d])), []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = (e.clientX - box.left) / box.width - 0.5;
    const py = (e.clientY - box.top) / box.height - 0.5;
    setTilt({ x: 46 - py * 22, z: -7 + px * 14 });
  };

  return (
    <section className="mt-10 border-y-2 border-ink-muted py-5">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        {t("plan.swarm")}
      </h2>
      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 46, z: -7 })}
        className="mt-2 [perspective:1000px]"
      >
        <div
          className="transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `rotateX(${tilt.x}deg) rotateZ(${tilt.z}deg)` }}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            width="100%"
            height="220"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            {[0, 25, 50, 75, 100].map((tick) => (
              <line
                key={tick}
                x1={x(tick)}
                x2={x(tick)}
                y1={MARGIN.top}
                y2={MARGIN.top + BAND}
                stroke="currentColor"
                strokeWidth={1}
                className="text-ink-faint"
                opacity={0.18}
              />
            ))}
            {nodes.map((n) => {
              const d = byId.get(n.id);
              if (!d) return null;
              return (
                <g key={n.id}>
                  <ellipse
                    cx={n.x}
                    cy={n.y + n.r * 0.9}
                    rx={n.r * 0.9}
                    ry={n.r * 0.35}
                    fill="currentColor"
                    className="text-ink-faint"
                    opacity={0.18}
                  />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={healthColor(d.score, DEFAULT_SETTINGS)}
                    opacity={0.85}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
