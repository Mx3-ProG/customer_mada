import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Eye } from "lucide-react";
import {
  useAllClients,
  useAllSubscriptions,
  useIsSuperadmin,
  useSetUserPlan,
} from "@/hooks/useSuperadmin";
import { useScoreSettings } from "@/hooks/useScoreSettings";
import { useI18n } from "@/i18n";
import { Input } from "@/components/ui/input";
import { DateField } from "@/components/ui/date-field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ClientSearchButton } from "@/components/clients/ClientSearchDialog";
import { MobileNav } from "@/components/layout/MobileNav";

import { ClientDetailDialog } from "@/components/clients/ClientDetailDialog";
import { AdminExportDialog } from "@/components/admin/AdminExportDialog";
import { TableSkeleton } from "@/components/skeletons/PageSkeletons";
import type { AdminClientRow } from "@/lib/admin.functions";

import {
  computeMetrics,
  daysBetween,
  formatDate,
  formatMoney,
  scoreTone,
  DEFAULT_SETTINGS,
} from "@/lib/clients";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Superadmin — tous les comptes | Mada Customer Software" },
      {
        name: "description",
        content:
          "Vue superadmin : tous les clients de tous les comptes utilisateurs, filtres, export CSV/Excel et KPI consolidés.",
      },
      { property: "og:title", content: "Superadmin — tous les comptes | Mada" },
      {
        property: "og:description",
        content: "Consolidation de tous les portefeuilles clients de la plateforme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

const toneClass = {
  ok: "text-health-hi",
  warm: "text-health-warm",
  alarm: "text-alarm",
} as const;

const ACTIVE_WINDOW_DAYS = 90;

function isActiveClient(row: AdminClientRow) {
  const d = daysBetween(row.last_interaction_at);
  return d !== null && d <= ACTIVE_WINDOW_DAYS;
}

function AdminDashboard() {
  const { t } = useI18n();
  const { data: isSuperadmin, isLoading: roleLoading } = useIsSuperadmin();
  const { data: rows = [], isLoading, error } = useAllClients(Boolean(isSuperadmin));
  const { data: subscriptions = [], isLoading: subsLoading } = useAllSubscriptions(
    Boolean(isSuperadmin),
  );
  const setUserPlan = useSetUserPlan();
  const { data: settings = DEFAULT_SETTINGS } = useScoreSettings();

  const [search, setSearch] = useState("");
  const [account, setAccount] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<AdminClientRow | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const accounts = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.user_id, r.owner_email));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (account !== "all" && r.user_id !== account) return false;
      if (status !== "all") {
        const active = isActiveClient(r);
        if (status === "active" && !active) return false;
        if (status === "inactive" && active) return false;
      }
      const created = r.created_at.slice(0, 10);
      if (from && created < from) return false;
      if (to && created > to) return false;
      if (
        q &&
        ![r.name, r.product ?? "", r.sector ?? "", r.owner_email].some((v) =>
          v.toLowerCase().includes(q),
        )
      )
        return false;
      return true;
    });
  }, [rows, search, account, status, from, to]);

  const stats = useMemo(() => {
    const metrics = filtered.map((r) => computeMetrics(r, settings));
    const revenue = filtered.reduce((s, r) => s + Number(r.sale_price), 0);
    const margin = metrics.reduce((s, m) => s + m.margin, 0);
    const avg = metrics.length
      ? Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length)
      : 0;
    return {
      accounts: new Set(filtered.map((r) => r.user_id)).size,
      clients: filtered.length,
      revenue,
      margin,
      avg,
      active: filtered.filter(isActiveClient).length,
    };
  }, [filtered, settings]);

  const kpis = useMemo(
    () => [
      { label: t("admin.accounts"), value: stats.accounts },
      { label: t("admin.clients"), value: stats.clients },
      { label: t("admin.statusActive"), value: stats.active },
      { label: t("admin.statusInactive"), value: stats.clients - stats.active },
      { label: t("admin.revenue"), value: stats.revenue },
      { label: t("admin.margin"), value: stats.margin },
      { label: t("admin.avgScore"), value: stats.avg },
    ],
    [stats, t],
  );

  const resetFilters = () => {
    setSearch("");
    setAccount("all");
    setStatus("all");
    setFrom("");
    setTo("");
  };

  if (!roleLoading && !isSuperadmin) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24 text-center">
          <p className="text-sm text-alarm">{t("admin.denied")}</p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4" /> {t("admin.back")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
              {t("admin.title")}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">{t("admin.subtitle")}</p>
          </div>
          <div className="hidden sm:flex sm:flex-wrap items-center justify-end gap-2">
            <ClientSearchButton />
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setExportOpen(true)}>
              <Download className="size-4" /> {t("admin.export")}
            </Button>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="size-4" /> {t("admin.back")}
              </Button>
            </Link>
          </div>
          <div className="flex sm:hidden items-center">
            <MobileNav current="admin" />
          </div>
        </header>


        <div className="mt-8 grid grid-cols-2 gap-px border-y-2 border-ink-muted bg-rule md:grid-cols-5">
          {[
            { label: t("admin.accounts"), value: String(stats.accounts) },
            { label: t("admin.clients"), value: `${stats.clients} (${stats.active} ✓)` },
            { label: t("admin.revenue"), value: formatMoney(stats.revenue) },
            { label: t("admin.margin"), value: formatMoney(stats.margin) },
            { label: t("admin.avgScore"), value: String(stats.avg) },
          ].map((k) => (
            <div key={k.label} className="bg-background px-4 py-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                {k.label}
              </div>
              <div className="mt-2 font-mono text-xl tabular-nums text-ink">{k.value}</div>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("admin.plansTitle")}
          </div>
          <p className="mt-1 text-xs text-ink-faint">{t("admin.plansHint")}</p>
          {subsLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : (
            <div className="mt-3 overflow-x-auto border-y-2 border-ink-muted">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-rule text-left font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                    <th className="py-3 pr-4 font-normal">{t("admin.owner")}</th>
                    <th className="py-3 pr-4 font-normal">{t("admin.plan")}</th>
                    <th className="py-3 font-normal">{t("admin.planStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s.user_id} className="border-b border-rule/60">
                      <td className="py-3 pr-4 font-mono text-[11px] text-ink-muted">
                        {s.owner_email}
                      </td>
                      <td className="py-3 pr-4">
                        <Select
                          value={s.plan}
                          onValueChange={(plan) =>
                            setUserPlan.mutate({
                              userId: s.user_id,
                              plan: plan as "free" | "pro",
                            })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">{t("admin.planFree")}</SelectItem>
                            <SelectItem value="pro">{t("admin.planPro")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-ink-faint">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("admin.filters")}
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.search")}
              className="w-full max-w-xs"
            />

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {t("admin.filterAccount")}
              </label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.allAccounts")}</SelectItem>
                  {accounts.map(([id, email]) => (
                    <SelectItem key={id} value={id}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {t("admin.filterStatus")}
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("admin.statusActive")}</SelectItem>
                  <SelectItem value="inactive">{t("admin.statusInactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {t("admin.createdFrom")}
              </label>
              <DateField
                value={from || null}
                onChange={(v) => setFrom(v ?? "")}
                className="w-44"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {t("admin.createdTo")}
              </label>
              <DateField value={to || null} onChange={(v) => setTo(v ?? "")} className="w-44" />
            </div>


            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {t("admin.resetFilters")}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-ink-faint">{t("admin.statusHint")}</p>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint tabular-nums">
              {filtered.length} / {rows.length}
            </span>
          </div>
        </section>

        <div className="mt-4">
          {error ? (
            <p className="py-16 text-center text-sm text-alarm">{t("admin.error")}</p>
          ) : isLoading || roleLoading ? (
            <TableSkeleton rows={7} cols={8} />

          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-faint">{t("admin.empty")}</p>
          ) : (
            <div className="overflow-x-auto border-y-2 border-ink-muted">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-rule text-left font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                    <th className="py-3 pr-4 font-normal">{t("admin.owner")}</th>
                    <th className="py-3 pr-4 font-normal">{t("table.client")}</th>
                    <th className="py-3 pr-4 font-normal">{t("table.product")}</th>
                    <th className="py-3 pr-4 font-normal">{t("col.status")}</th>
                    <th className="py-3 pr-4 font-normal">{t("col.createdAt")}</th>
                    <th className="py-3 pr-4 font-normal">{t("table.lastInteraction")}</th>
                    <th className="py-3 pr-4 text-right font-normal">{t("table.price")}</th>
                    <th className="py-3 pr-4 text-right font-normal">{t("table.margin")}</th>
                    <th className="py-3 pr-4 text-right font-normal">{t("table.score")}</th>
                    <th className="py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const m = computeMetrics(r, settings);
                    const active = isActiveClient(r);
                    return (
                      <tr key={r.id} className="border-b border-rule/60">
                        <td className="py-3 pr-4 font-mono text-[11px] text-ink-muted">
                          {r.owner_email}
                        </td>
                        <td className="py-3 pr-4 text-ink">{r.name}</td>
                        <td className="py-3 pr-4 text-ink-muted">{r.product || "—"}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`font-mono text-[10px] uppercase tracking-[0.14em] ${active ? "text-health-hi" : "text-ink-faint"}`}
                          >
                            {active ? t("admin.statusActive") : t("admin.statusInactive")}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[12px] tabular-nums text-ink-muted">
                          {formatDate(r.created_at.slice(0, 10))}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[12px] tabular-nums text-ink-muted">
                          {formatDate(r.last_interaction_at)}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-[12px] tabular-nums text-ink">
                          {formatMoney(Number(r.sale_price))}
                        </td>
                        <td
                          className={`py-3 pr-4 text-right font-mono text-[12px] tabular-nums ${m.margin < 0 ? "text-alarm" : "text-ink"}`}
                        >
                          {formatMoney(m.margin)}
                        </td>
                        <td
                          className={`py-3 pr-4 text-right font-mono text-[15px] tabular-nums ${toneClass[scoreTone(m.score, settings)]}`}
                        >
                          {m.score}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={t("admin.viewAria", { name: r.name })}
                            onClick={() => setDetail(r)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ClientDetailDialog
        client={detail}
        ownerLabel={detail?.owner_email}
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        settings={settings}
      />
      <AdminExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        rows={filtered}
        settings={settings}
        isActive={isActiveClient}
        kpis={kpis}
      />
    </main>
  );
}
