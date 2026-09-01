import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Lock,
  Plus,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/hooks/useClients";
import { useScoreSettings } from "@/hooks/useScoreSettings";
import { useIsSuperadmin } from "@/hooks/useSuperadmin";
import { usePlan } from "@/hooks/usePlan";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientExportDialog } from "@/components/clients/ClientExportDialog";
import { KpiRow } from "@/components/clients/KpiRow";
import { HealthSwarm } from "@/components/clients/HealthSwarm";
import { ScoreSettingsDialog } from "@/components/clients/ScoreSettingsDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ClientSearchButton } from "@/components/clients/ClientSearchDialog";
import { MobileNav, type MobileNavItem } from "@/components/layout/MobileNav";

import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_SETTINGS, type Client } from "@/lib/clients";
import { hasAccess } from "@/lib/billing";
import { TableSkeleton } from "@/components/skeletons/PageSkeletons";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord clients — Mada Customer Software" },
      {
        name: "description",
        content:
          "Ajoutez et suivez vos clients : interactions, paiements, marges et score de santé.",
      },
      {
        property: "og:title",
        content: "Tableau de bord clients — Mada Customer Software",
      },
      {
        property: "og:description",
        content:
          "Votre portefeuille client, sa rentabilité et ses signaux de risque.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { data: clients = [], isLoading, error } = useClients();
  const { data: settings = DEFAULT_SETTINGS } = useScoreSettings();
  const { data: isSuperadmin } = useIsSuperadmin();
  const { plan } = usePlan();
  const [formOpen, setFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const canAdd = hasAccess(plan);
  const locked = !plan.isPro;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.product ?? "").toLowerCase().includes(q),
    );
  }, [clients, search]);

  const exportRows = useMemo(
    () =>
      selectedIds.length
        ? clients.filter((c) => selectedIds.includes(c.id))
        : filtered,
    [clients, filtered, selectedIds],
  );

  const toggleRow = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleAll = (checked: boolean) =>
    setSelectedIds(checked ? filtered.map((c) => c.id) : []);

  const openNew = () => {
    if (!canAdd) {
      navigate({ to: "/pricing" });
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };

  const mobileExtraItems = useMemo<MobileNavItem[]>(() => {
    return [
      {
        label: t("dash.scoreFormula"),
        icon: locked ? Lock : SlidersHorizontal,
        onClick: () => {
          if (locked) navigate({ to: "/pricing" });
          else setSettingsOpen(true);
        },
        variant: locked ? "default" : "accent",
      },
      {
        label: t("export.nav"),
        icon: Download,
        onClick: () => setExportOpen(true),
      },
      {
        label: t("dash.addClient"),
        icon: Plus,
        onClick: openNew,
        variant: "accent",
      },
    ];
  }, [t, locked, navigate, openNew, setSettingsOpen]);

  const openEdit = (client: Client) => {
    setEditing(client);
    setFormOpen(true);
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between">
          <h1 className="flex min-w-0 items-center gap-2.5 font-serif text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
            <img
              src="/logo-mada.png"
              alt="Mada Customer Software"
              width={512}
              height={256}
              className="h-7 w-auto shrink-0"
            />
            <span className="truncate">
              Mada <span className="text-ink-muted">{t("dash.portfolio")}</span>
            </span>
          </h1>
          <div className="hidden sm:flex sm:flex-wrap items-center justify-end gap-2">
            <ClientSearchButton />
            <LanguageSwitcher />
            <ThemeToggle />
            {isSuperadmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <Shield className="size-4" /> {t("admin.nav")}
                </Button>
              </Link>
            )}
            <Link to="/team">
              <Button variant="ghost" size="sm">
                <Users className="size-4" /> {t("team.nav")}
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm">
                <Sparkles className="size-4" /> {t("plan.nav")}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExportOpen(true)}
            >
              <Download className="size-4" /> {t("export.nav")}
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              {t("dash.signOut")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title={locked ? t("plan.proOnly") : undefined}
              onClick={() =>
                locked ? navigate({ to: "/pricing" }) : setSettingsOpen(true)
              }
            >
              {locked ? (
                <Lock className="size-4" />
              ) : (
                <SlidersHorizontal className="size-4" />
              )}{" "}
              {t("dash.scoreFormula")}
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="size-4" /> {t("dash.addClient")}
            </Button>
          </div>
          <div className="flex sm:hidden items-center">
            <MobileNav
              current="dashboard"
              extraItems={mobileExtraItems}
              showSignOut
            />
          </div>
        </header>

        {!plan.isPro && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y-2 border-ink-muted px-4 py-3">
            <p className="text-sm text-ink-muted">{t("plan.noPlan")}</p>
            <Link to="/pricing">
              <Button size="sm">
                <Sparkles className="size-4" /> {t("plan.startTrial")}
              </Button>
            </Link>
          </div>
        )}

        <KpiRow clients={clients} settings={settings} />

        <HealthSwarm
          clients={filtered}
          settings={settings}
          onSelect={openEdit}
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("dash.search")}
            className="max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-3">
            {selectedIds.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds([])}
              >
                <X className="size-4" /> {t("export.clearSelection")}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExportOpen(true)}
            >
              <Download className="size-4" />{" "}
              {selectedIds.length
                ? t("export.scopeSelected", {
                    count: String(selectedIds.length),
                  })
                : t("export.scopeAll", { count: String(filtered.length) })}
            </Button>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint tabular-nums">
              {filtered.length} / {clients.length}
            </span>
          </div>
        </div>

        <div className="mt-4">
          {error ? (
            <p className="py-16 text-center text-sm text-alarm">
              {t("dash.loadError")}
            </p>
          ) : isLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : clients.length === 0 ? (
            <div className="border-y-2 border-ink-muted px-6 py-20 text-center">
              <h2 className="font-serif text-2xl text-ink">
                {t("dash.emptyTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
                {t("dash.emptyBody")}
              </p>
              <Button className="mt-6" onClick={openNew}>
                <Plus className="size-4" /> {t("dash.addClient")}
              </Button>
            </div>
          ) : (
            <ClientTable
              clients={filtered}
              onEdit={openEdit}
              settings={settings}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
            />
          )}
        </div>

        <p className="mt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
          {t("dash.footnote")}
        </p>
      </div>

      <ClientForm open={formOpen} onOpenChange={setFormOpen} client={editing} />
      <ClientExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        clients={exportRows}
        settings={settings}
      />
      <ScoreSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
      />
    </main>
  );
}
