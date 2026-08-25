import { useState } from "react";
import { toast } from "sonner";
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
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/i18n";
import type { ScoreSettings } from "@/lib/clients";
import type { AdminClientRow } from "@/lib/admin.functions";
import {
  buildTableAsync,
  exportCsv,
  exportXlsx,
  DEFAULT_EXPORT_COLUMNS,
  EXPORT_COLUMNS,
  type Kpi,
} from "@/lib/adminExport";

export function AdminExportDialog({
  open,
  onOpenChange,
  rows,
  settings,
  isActive,
  kpis,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: AdminClientRow[];
  settings: ScoreSettings;
  isActive: (row: AdminClientRow) => boolean;
  kpis: Kpi[];
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string[]>(DEFAULT_EXPORT_COLUMNS);
  const [withKpi, setWithKpi] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const busy = progress !== null;

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
    // Close the dialog immediately: the export keeps running in the background.
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
            <DialogDescription>{t("admin.exportColumns")}</DialogDescription>
          </DialogHeader>

          <div className="mb-3 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(EXPORT_COLUMNS.map((c) => c.id))}
            >
              {t("admin.selectAll")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              {t("admin.selectNone")}
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {EXPORT_COLUMNS.map((c) => (
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
