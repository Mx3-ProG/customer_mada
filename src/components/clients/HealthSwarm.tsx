import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { extent } from "d3-array";
import {
  computeMetrics,
  formatMoney,
  healthColor,
  DEFAULT_SETTINGS,
  type Client,
  type ScoreSettings,
} from "@/lib/clients";
import {
  useBeeswarmLayout,
  type BeeswarmInput,
} from "@/hooks/useBeeswarmLayout";
import { Axis } from "@/components/chart/Axis";
import { BeeswarmDot } from "@/components/chart/BeeswarmDot";
import { Tooltip } from "@/components/chart/Tooltip";
import { ScoreBreakdown } from "@/components/clients/ScoreBreakdown";
import { useI18n } from "@/i18n";

const WIDTH = 1080;
const MARGIN = { top: 26, right: 56, bottom: 38, left: 56 };
const BAND = 180;
const HEIGHT = MARGIN.top + BAND + MARGIN.bottom;

/** Nuée animée : position = score de santé, taille = prix d'achat. */
export function HealthSwarm({
  clients,
  settings = DEFAULT_SETTINGS,
  onSelect,
}: {
  clients: Client[];
  settings?: ScoreSettings;
  onSelect?: (client: Client) => void;
}) {
  const { t } = useI18n();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(WIDTH);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setWrapW(e?.contentRect.width ?? WIDTH),
    );
    ro.observe(el);
    setWrapW(el.clientWidth || WIDTH);
    return () => ro.disconnect();
  }, []);

  const innerW = WIDTH - MARGIN.left - MARGIN.right;
  const x = useMemo(
    () =>
      scaleLinear()
        .domain([0, 100])
        .range([MARGIN.left, MARGIN.left + innerW]),
    [innerW],
  );

  const scored = useMemo(
    () => clients.map((c) => ({ c, m: computeMetrics(c, settings) })),
    [clients, settings],
  );

  const radius = useMemo(() => {
    const [lo = 0, hi = 1] = extent(scored, (d) => Number(d.c.sale_price));
    return scaleSqrt()
      .domain([lo, hi || 1])
      .range([6, 20]);
  }, [scored]);

  const input = useMemo<BeeswarmInput[]>(
    () =>
      scored.map(({ c, m }) => ({
        id: c.id,
        x: x(m.score),
        y: MARGIN.top + BAND / 2,
        r: radius(Number(c.sale_price)),
        yMin: MARGIN.top,
        yMax: MARGIN.top + BAND,
      })),
    [scored, x, radius],
  );

  const nodes = useBeeswarmLayout(input, WIDTH);
  const byId = useMemo(() => new Map(scored.map((s) => [s.c.id, s])), [scored]);

  const hovered = hoveredId ? byId.get(hoveredId) : null;
  const hoveredNode = nodes.find((n) => n.id === hoveredId);
  const pxHeight = (HEIGHT / WIDTH) * wrapW;

  if (clients.length === 0) return null;

  return (
    <section className="mt-8 border-y-2 border-ink-muted py-4">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        {t("chart.title")}
      </h2>
      <div ref={wrapRef} className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height={pxHeight}
          preserveAspectRatio="xMidYMid meet"
        >
          <g aria-hidden>
            <line
              x1={x(settings.risk_threshold)}
              x2={x(settings.risk_threshold)}
              y1={MARGIN.top + 2}
              y2={HEIGHT - MARGIN.bottom + 12}
              stroke="currentColor"
              strokeWidth={1}
              className="text-ink-faint"
              opacity={0.35}
            />
            <text
              x={x(settings.risk_threshold) + 6}
              y={MARGIN.top - 6}
              className="fill-ink-faint font-mono text-[10px] uppercase tracking-[0.16em]"
            >
              {t("chart.riskLine")}
            </text>
          </g>

          {nodes.map((n) => {
            const entry = byId.get(n.id);
            if (!entry) return null;
            return (
              <BeeswarmDot
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={healthColor(entry.m.score, settings)}
                dimmed={hoveredId !== null && hoveredId !== n.id}
                hovered={hoveredId === n.id}
                selected={false}
                label={t("chart.dotLabel", {
                  name: entry.c.name,
                  score: entry.m.score,
                })}
                onEnter={() => setHoveredId(n.id)}
                onLeave={() => setHoveredId((c) => (c === n.id ? null : c))}
                onSelect={() => onSelect?.(entry.c)}
              />
            );
          })}

          <Axis scale={x} ticks={[0, 20, 40, 60, 80, 100]} y={HEIGHT - 12} />
        </svg>

        {hovered && hoveredNode && (
          <Tooltip
            x={`${(hoveredNode.x / WIDTH) * 100}%`}
            y={`${((hoveredNode.y - hoveredNode.r) / HEIGHT) * 100}%`}
          >
            <div className="whitespace-nowrap">
              <div className="text-[13px] text-ink">{hovered.c.name}</div>
              <div className="mt-1 flex gap-3 font-mono text-[11px] text-ink-muted tabular-nums">
                <span>{formatMoney(Number(hovered.c.sale_price))}</span>
                <span>
                  {t("chart.score")} {hovered.m.score}
                </span>
                <span className="font-sans text-ink-faint">
                  {hovered.c.sector || hovered.c.product || "—"}
                </span>
              </div>
              <div className="mt-2 min-w-[160px] border-t border-rule pt-2">
                <ScoreBreakdown drivers={hovered.m.drivers} dense />
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    </section>
  );
}
