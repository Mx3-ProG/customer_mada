import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useI18n } from "@/i18n";
import { computeMetrics, daysBetween, type Client, type ScoreSettings } from "@/lib/clients";
import type { AdminClientRow } from "@/lib/admin.functions";
import {
  buildTableAsync,
  exportCsv,
  exportXlsx,
  DEFAULT_EXPORT_COLUMNS,
  EXPORT_COLUMNS,
  type Kpi,
} from "@/lib/adminExport";

const ACTIVE_WINDOW_DAYS = 90;
const isActive = (row: AdminClientRow) => {
  const d = daysBetween(row.last_interaction_at);
  return d !== null && d <= ACTIVE_WINDOW_DAYS;
};

const COLUMNS = EXPORT_COLUMNS.filter((c) => c.id !== "owner");
const DEFAULTS = DEFAULT_EXPORT_COLUMNS.filter((id) => id !== "owner");

/** CSV / Excel export of the user's own clients (all, filtered or hand-picked). */
export function ClientExportDialog({
  open,
  onOpenChange,
  clients,
  settings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  settings: ScoreSettings;
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string[]>(DEFAULTS);
  const [withKpi, setWithKpi] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const busy = progress !== null;

  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [clientQuery, setClientQuery] = useState("");
  const [sector, setSector] = useState("all");

  useEffect(() => {
    if (open) {
      setPickedIds(clients.map((c) => c.id));
      setClientQuery("");
      setSector("all");
    }
  }, [open, clients]);

  const sectors = useMemo(
    () => Array.from(new Set(clients.map((c) => c.sector).filter(Boolean) as string[])).sort(),
    [clients],
  );

  const visibleClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    return clients.filter((c) => {
      if (sector !== "all" && (c.sector ?? "") !== sector) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.product ?? "").toLowerCase().includes(q) ||
        (c.sector ?? "").toLowerCase().includes(q)
      );
    });
  }, [clients, clientQuery, sector]);

  const togglePicked = (id: string) =>
    setPickedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const rows = useMemo(
    () =>
      clients
        .filter((c) => pickedIds.includes(c.id))
        .map((c) => ({ ...c, owner_email: "" }) as AdminClientRow),
    [clients, pickedIds],
  );


  const kpis = useMemo<Kpi[]>(() => {
    const metrics = rows.map((r) => computeMetrics(r, settings));
    const revenue = rows.reduce((s, r) => s + Number(r.sale_price), 0);
    const margin = metrics.reduce((s, m) => s + m.margin, 0);
    const avg = metrics.length
      ? Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length)
      : 0;
    const active = rows.filter(isActive).length;
    return [
      { label: t("admin.clients"), value: rows.length },
      { label: t("admin.statusActive"), value: active },
      { label: t("admin.statusInactive"), value: rows.length - active },
      { label: t("admin.revenue"), value: revenue },
      { label: t("admin.margin"), value: margin },
      { label: t("admin.avgScore"), value: avg },
    ];
  }, [rows, settings, t]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const run = async (kind: "csv" | "xlsx") => {
    if (!rows.length || !selected.length) {
      toast.error(t("admin.exportEmpty"));
      return;
    }
    const total = rows.length;
    const toastId = toast.loading(`${t("admin.export")} — 0% (0/${total})`);
    setProgress(0);
    onOpenChange(false);

    try {
      const table = await buildTableAsync(rows, selected, settings, isActive, t, (ratio) => {
        const pct = Math.round(ratio * 90);
        setProgress(pct);
        toast.loading(`${t("admin.export")} — ${pct}% (${Math.round(ratio * total)}/${total})`, {
          id: toastId,
        });
      });

      setProgress(95);
      const name = `mada-clients-${new Date().toISOString().slice(0, 10)}`;
      const sheetKpis = withKpi ? kpis : null;
      if (kind === "csv") exportCsv(table, sheetKpis, name);
      else exportXlsx(table, sheetKpis, t("admin.clients"), t("admin.kpiSheet"), name);

      setProgress(100);
      toast.success(`${t("admin.exported")} (${total})`, { id: toastId });
    } catch {
      toast.error(t("admin.error"), { id: toastId });
    } finally {
      setProgress(null);
    }
  };

  return (
    <>
      {busy && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(420px,90vw)] -translate-x-1/2 border-2 border-ink-muted bg-background px-4 py-3 shadow-lg">
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            <span>{t("admin.export")}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress ?? 0} className="mt-2 h-1.5" />
        </div>
      )}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("admin.export")}</DialogTitle>
            <DialogDescription>
              {t("admin.exportColumns")} — {rows.length}
            </DialogDescription>
          </DialogHeader>

          <Collapsible className="mb-4 border-2 border-ink-muted">
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                {t("export.pickClients")}
              </span>
              <span className="flex items-center gap-2 text-sm text-ink">
                <span className="tabular-nums">
                  {t("export.chosen", { n: String(rows.length), total: String(clients.length) })}
                </span>
                <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t-2 border-ink-muted p-3">
              <div className="flex flex-wrap gap-2">
                <Input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder={t("export.searchClients")}
                  className="h-9 max-w-[220px] flex-1"
                />
                {sectors.length > 0 && (
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="h-9 border-2 border-ink-muted bg-background px-2 text-sm text-ink"
                  >
                    <option value="all">{t("export.allSectors")}</option>
                    {sectors.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setPickedIds((prev) =>
                      Array.from(new Set([...prev, ...visibleClients.map((c) => c.id)])),
                    )
                  }
                >
                  {t("admin.selectAll")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setPickedIds((prev) =>
                      prev.filter((id) => !visibleClients.some((c) => c.id === id)),
                    )
                  }
                >
                  {t("admin.selectNone")}
                </Button>
              </div>

              <div className="mt-2 max-h-56 overflow-y-auto border-t-2 border-ink-muted/40 pt-2">
                {visibleClients.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-muted">{t("export.noClients")}</p>
                ) : (
                  visibleClients.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 py-1.5 text-sm text-ink"
                    >
                      <Checkbox
                        checked={pickedIds.includes(c.id)}
                        onCheckedChange={() => togglePicked(c.id)}
                      />
                      <span className="truncate">{c.name}</span>
                      {(c.product || c.sector) && (
                        <span className="truncate text-xs text-ink-faint">
                          {[c.product, c.sector].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="mb-3 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelected(COLUMNS.map((c) => c.id))}>
              {t("admin.selectAll")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              {t("admin.selectNone")}
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {COLUMNS.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-ink">
                <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
                {t(c.label)}
              </label>
            ))}
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm text-ink-muted">
            <Checkbox checked={withKpi} onCheckedChange={(v) => setWithKpi(v === true)} />
            {t("admin.includeKpi")}
          </label>

          <DialogFooter className="mt-4">
            <Button variant="ghost" disabled={busy} onClick={() => run("csv")}>
              {t("admin.exportCsv")}
            </Button>
            <Button disabled={busy} onClick={() => run("xlsx")}>
              {t("admin.exportXlsx")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
