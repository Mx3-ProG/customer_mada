import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_SETTINGS, type ScoreSettings } from "@/lib/clients";
import { useSaveScoreSettings } from "@/hooks/useScoreSettings";
import { useI18n } from "@/i18n";

type Row = { key: keyof ScoreSettings; hasHint?: boolean; step?: string };

const GROUPS: { titleKey: string; rows: Row[] }[] = [
  {
    titleKey: "settings.group.interaction",
    rows: [
      { key: "interaction_grace_days", hasHint: true },
      { key: "interaction_days_per_point", step: "0.5" },
      { key: "interaction_max_penalty" },
      { key: "interaction_missing_penalty" },
    ],
  },
  {
    titleKey: "settings.group.payments",
    rows: [
      { key: "overdue_points_per_day", step: "0.5" },
      { key: "overdue_max_penalty" },
      { key: "no_payment_penalty" },
      { key: "no_payment_after_days" },
    ],
  },
  {
    titleKey: "settings.group.profitability",
    rows: [
      { key: "margin_good_rate", hasHint: true, step: "0.05" },
      { key: "margin_ok_rate", step: "0.05" },
      { key: "margin_ok_penalty" },
      { key: "margin_low_penalty" },
      { key: "margin_negative_penalty" },
      { key: "no_price_penalty" },
    ],
  },
  {
    titleKey: "settings.group.loyalty",
    rows: [
      { key: "loyalty_days" },
      { key: "loyalty_bonus" },
      { key: "risk_threshold" },
      { key: "alarm_threshold" },
    ],
  },
];

export function ScoreSettingsDialog({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ScoreSettings;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<ScoreSettings>(settings);
  const save = useSaveScoreSettings();

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  const set = (key: keyof ScoreSettings, value: number) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.alarm_threshold >= draft.risk_threshold) {
      toast.error(t("settings.errThresholds"));
      return;
    }
    if (draft.margin_ok_rate > draft.margin_good_rate) {
      toast.error(t("settings.errMargins"));
      return;
    }
    try {
      await save.mutateAsync(draft);
      toast.success(t("settings.saved"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{t("settings.title")}</DialogTitle>
          <DialogDescription>
            {t("settings.desc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {GROUPS.map((g) => (
            <div key={g.titleKey} className="space-y-3">
              <h3 className="border-b border-rule pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                {t(g.titleKey as never)}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {g.rows.map((r) => (
                  <div key={r.key} className="space-y-1.5">
                    <Label className="text-[12px] text-ink-muted">{t(`settings.${r.key}` as never)}</Label>
                    <Input
                      type="number"
                      step={r.step ?? "1"}
                      min={0}
                      value={draft[r.key]}
                      onChange={(e) => set(r.key, Number(e.target.value))}
                    />
                    {r.hasHint && (
                      <p className="text-[11px] text-ink-faint">
                        {t(`settings.${r.key}.hint` as never)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setDraft(DEFAULT_SETTINGS)}>
              {t("settings.reset")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t("common.saving") : t("settings.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
