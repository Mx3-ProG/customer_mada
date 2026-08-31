import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import {
  computeMetrics,
  formatAgo,
  formatDate,
  formatMoney,
  scoreTone,
  DEFAULT_SETTINGS,
  type Client,
  type ScoreSettings,
} from "@/lib/clients";
import {
  SORT_KEYS,
  defaultDirFor,
  sortValue,
  type SortKey,
} from "@/lib/clientSort";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useDeleteClient } from "@/hooks/useClients";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

const toneClass = {
  ok: "text-health-hi",
  warm: "text-health-warm",
  alarm: "text-alarm",
} as const;

export function ClientTable({
  clients,
  onEdit,
  settings = DEFAULT_SETTINGS,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: {
  clients: Client[];
  onEdit: (client: Client) => void;
  settings?: ScoreSettings;
  selectedIds?: string[];
  onToggleRow?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
}) {
  const { t } = useI18n();
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const remove = useDeleteClient();

  const rows = useMemo(
    () =>
      clients
        .map((c) => ({ client: c, m: computeMetrics(c, settings) }))
        .sort((a, b) =>
          sortDir === "asc"
            ? sortValue(a.m, sortKey) - sortValue(b.m, sortKey)
            : sortValue(b.m, sortKey) - sortValue(a.m, sortKey),
        ),
    [clients, settings, sortKey, sortDir],
  );

  const selectable = Boolean(onToggleRow);
  const allSelected =
    selectable &&
    clients.length > 0 &&
    clients.every((c) => selectedIds?.includes(c.id));

  const sortLabel = (key: SortKey) =>
    key === "score"
      ? t("table.sortScore")
      : key === "margin"
        ? t("table.sortMargin")
        : t(`driver.${key}` as never);

  return (
    <>
      <div className="mb-3 flex items-center justify-end gap-2">
        <Select
          value={sortKey}
          onValueChange={(v) => {
            const key = v as SortKey;
            setSortKey(key);
            setSortDir(defaultDirFor(key));
          }}
        >
          <SelectTrigger className="w-auto gap-2 text-[12px]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {t("table.sortBy")}
            </span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {sortLabel(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("table.sortToggle")}
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        >
          {sortDir === "asc" ? (
            <ArrowUp className="size-4" />
          ) : (
            <ArrowDown className="size-4" />
          )}
        </Button>
      </div>

      <div className="overflow-x-auto border-y-2 border-ink-muted">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule text-left font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              {selectable && (
                <th className="w-8 py-3 pr-3 font-normal">
                  <Checkbox
                    aria-label={t("export.select")}
                    checked={allSelected}
                    onCheckedChange={(v) => onToggleAll?.(v === true)}
                  />
                </th>
              )}
              <th className="py-3 pr-4 font-normal">{t("table.client")}</th>
              <th className="py-3 pr-4 font-normal">{t("table.product")}</th>
              <th className="py-3 pr-4 font-normal">{t("table.sector")}</th>
              <th className="py-3 pr-4 font-normal">{t("table.entry")}</th>

              <th className="py-3 pr-4 font-normal">
                {t("table.lastInteraction")}
              </th>
              <th className="py-3 pr-4 font-normal">
                {t("table.lastPayment")}
              </th>
              <th className="py-3 pr-4 text-right font-normal">
                {t("table.price")}
              </th>
              <th className="py-3 pr-4 text-right font-normal">
                {t("table.margin")}
              </th>
              <th className="py-3 pr-4 text-right font-normal">
                {t("table.score")}
              </th>
              <th className="py-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client, m }) => (
              <tr
                key={client.id}
                className="border-b border-rule/60 align-middle"
              >
                {selectable && (
                  <td className="py-3 pr-3">
                    <Checkbox
                      aria-label={t("export.selectRow", { name: client.name })}
                      checked={selectedIds?.includes(client.id) ?? false}
                      onCheckedChange={() => onToggleRow?.(client.id)}
                    />
                  </td>
                )}
                <td className="py-3 pr-4 text-ink">
                  {client.name}
                  {m.paymentOverdueDays > 0 && (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-alarm">
                      {t("table.overdue", { days: m.paymentOverdueDays })}
                    </span>
                  )}
                  {(client.phone || client.email) && (
                    <div className="mt-0.5 font-mono text-[10px] text-ink-faint">
                      {[client.phone, client.email].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </td>
                <td className="py-3 pr-4 text-ink-muted">
                  {client.product || "—"}
                </td>
                <td className="py-3 pr-4 text-ink-muted">
                  {client.sector || "—"}
                </td>

                <td className="py-3 pr-4 font-mono text-[12px] tabular-nums text-ink-muted">
                  {formatDate(client.entry_date)}
                </td>
                <td className="py-3 pr-4 font-mono text-[12px] tabular-nums text-ink-muted">
                  {formatDate(client.last_interaction_at)}
                  <span className="ml-2 text-ink-faint">
                    {formatAgo(m.daysSinceInteraction, {
                      today: t("time.today"),
                      dayShort: t("time.dayShort"),
                    })}
                  </span>
                </td>
                <td className="py-3 pr-4 font-mono text-[12px] tabular-nums text-ink-muted">
                  {formatDate(client.last_payment_at)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-[12px] tabular-nums text-ink">
                  {formatMoney(Number(client.sale_price))}
                  <div className="text-[10px] text-ink-faint">
                    {client.sale_price_frequency === "monthly"
                      ? t("form.frequencyMonthly")
                      : t("form.frequencyOneTime")}
                  </div>
                </td>
                <td
                  className={`py-3 pr-4 text-right font-mono text-[12px] tabular-nums ${m.margin < 0 ? "text-alarm" : "text-ink"}`}
                >
                  {formatMoney(m.margin)}
                  <span className="ml-1 text-ink-faint">
                    ({Math.round(m.marginRate * 100)}%)
                  </span>
                </td>
                <td
                  className={`py-3 pr-4 text-right font-mono text-[15px] tabular-nums ${toneClass[scoreTone(m.score, settings)]}`}
                  title={m.drivers
                    .map(
                      (d) =>
                        `${t(`driver.${d.key}` as never)}: ${d.points > 0 ? "+" : ""}${d.points}`,
                    )
                    .join("\n")}
                >
                  {m.score}
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("table.editAria", { name: client.name })}
                    onClick={() => onEdit(client)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("table.deleteAria", { name: client.name })}
                    onClick={() => setPendingDelete(client)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("table.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("table.deleteBody", { name: pendingDelete?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await remove.mutateAsync(pendingDelete.id);
                  toast.success(t("table.deleted"));
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : t("table.deleteFailed"),
                  );
                }
                setPendingDelete(null);
              }}
            >
              {t("table.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
