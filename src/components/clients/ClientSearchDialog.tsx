import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { useScoreSettings } from "@/hooks/useScoreSettings";
import { ClientDetailDialog } from "@/components/clients/ClientDetailDialog";
import { computeMetrics, scoreTone, DEFAULT_SETTINGS, type Client } from "@/lib/clients";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const toneClass = {
  ok: "text-health-hi",
  warm: "text-health-warm",
  alarm: "text-alarm",
} as const;

/** Command palette to find a client anywhere and open its record. */
export function ClientSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { data: clients = [], isLoading } = useClients();
  const { data: settings = DEFAULT_SETTINGS } = useScoreSettings();
  const [selected, setSelected] = useState<Client | null>(null);

  const rows = useMemo(
    () =>
      clients.map((c) => ({
        client: c,
        score: computeMetrics(c, settings).score,
        value: [c.name, c.product, c.sector, c.email, c.phone, c.siret]
          .filter(Boolean)
          .join(" "),
      })),
    [clients, settings],
  );

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput placeholder={t("search.placeholder")} />
        <CommandList>
          <CommandEmpty>{isLoading ? t("common.loading") : t("search.empty")}</CommandEmpty>
          <CommandGroup heading={t("search.clients")}>
            {rows.map(({ client, score, value }) => (
              <CommandItem
                key={client.id}
                value={value}
                onSelect={() => {
                  setSelected(client);
                  onOpenChange(false);
                }}
              >
                <span className="truncate text-ink">{client.name}</span>
                {client.product && (
                  <span className="ml-2 truncate text-xs text-ink-muted">{client.product}</span>
                )}
                <span
                  className={cn(
                    "ml-auto font-mono text-xs tabular-nums",
                    toneClass[scoreTone(score, settings)],
                  )}
                >
                  {score}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <ClientDetailDialog
        client={selected}
        subtitle={[selected?.product, selected?.sector].filter(Boolean).join(" · ") || undefined}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        settings={settings}
      />
    </>
  );
}

/** Header button that opens the client search palette. */
export function ClientSearchButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" className={className} onClick={() => setOpen(true)}>
        <Search className="size-4" /> {t("search.clients")}
      </Button>
      <ClientSearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
