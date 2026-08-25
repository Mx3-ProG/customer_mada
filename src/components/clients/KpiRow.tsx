import { useMemo } from "react";
import {
  computeMetrics,
  formatMoney,
  DEFAULT_SETTINGS,
  type Client,
  type ScoreSettings,
} from "@/lib/clients";
import { useI18n } from "@/i18n";

function Stat({ label, value, sub, bad }: { label: string; value: string; sub: string; bad?: boolean }) {
  return (
    <div className="px-3 py-4 text-center sm:px-6 sm:py-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">{label}</div>
      <div className="mt-2 font-mono text-[28px] leading-none sm:text-[40px] tracking-tight text-ink tabular-nums">
        {value}
      </div>
      <div className={`mt-2 font-mono text-[11px] tabular-nums ${bad ? "text-alarm" : "text-ink-faint"}`}>
        {sub}
      </div>
    </div>
  );
}

export function KpiRow({
  clients,
  settings = DEFAULT_SETTINGS,
}: {
  clients: Client[];
  settings?: ScoreSettings;
}) {
  const { t } = useI18n();
  const stats = useMemo(() => {
    const metrics = clients.map((c) => computeMetrics(c, settings));
    const revenue = clients.reduce((acc, c) => acc + Number(c.sale_price), 0);
    const margin = metrics.reduce((acc, m) => acc + m.margin, 0);
    const atRisk = metrics.filter((m) => m.score < settings.risk_threshold);
    const scores = metrics.map((m) => m.score).sort((a, b) => a - b);
    const median = scores.length
      ? scores.length % 2
        ? scores[(scores.length - 1) / 2]!
        : (scores[scores.length / 2 - 1]! + scores[scores.length / 2]!) / 2
      : 0;
    const revenueAtRisk = clients
      .filter((_, i) => metrics[i]!.score < settings.risk_threshold)
      .reduce((acc, c) => acc + Number(c.sale_price), 0);
    return { revenue, margin, atRisk: atRisk.length, median, revenueAtRisk };
  }, [clients, settings]);

  return (
    <section className="mt-5 grid grid-cols-2 divide-x divide-rule border-y-2 border-ink-muted sm:grid-cols-4">
      <Stat
        label={t("kpi.revenue")}
        value={formatMoney(stats.revenue)}
        sub={t("kpi.clientsCount", { count: clients.length })}
      />
      <Stat
        label={t("kpi.margin")}
        value={formatMoney(stats.margin)}
        sub={
          stats.revenue > 0
            ? t("kpi.ofRevenue", { pct: Math.round((stats.margin / stats.revenue) * 100) })
            : "—"
        }
        bad={stats.margin < 0}
      />
      <Stat
        label={t("kpi.atRisk")}
        value={String(stats.atRisk)}
        sub={t("kpi.exposed", { amount: formatMoney(stats.revenueAtRisk) })}
        bad={stats.atRisk > 0}
      />
      <Stat
        label={t("kpi.medianScore")}
        value={stats.median.toFixed(0)}
        sub={t("kpi.riskThreshold", { value: settings.risk_threshold })}
      />
    </section>
  );
}
