import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ClientSearchButton } from "@/components/clients/ClientSearchDialog";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePlan } from "@/hooks/usePlan";
import type { PlanKind } from "@/lib/billing";

import { PlanSwarm } from "@/components/pricing/PlanSwarm";
import { CardsSkeleton } from "@/components/skeletons/PageSkeletons";
import {
  createProCheckout,
  createBillingPortal,
} from "@/lib/billing.functions";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — Mada Customer Software" },
      {
        name: "description",
        content:
          "399 € par an ou 39,99 € par mois pour des clients illimités, l'export CSV/Excel et la formule de score personnalisée. 14 jours d'essai gratuit sans carte bancaire pour les nouveaux comptes.",
      },
      { property: "og:title", content: "Tarifs — Mada Customer Software" },
      {
        property: "og:description",
        content:
          "399 €/an ou 39,99 €/mois. Essai gratuit de 14 jours, sans CB.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { t } = useI18n();
  const { plan, isLoading: planLoading } = usePlan();
  const checkout = useServerFn(createProCheckout);
  const portal = useServerFn(createBillingPortal);
  const [busy, setBusy] = useState<PlanKind | "portal" | null>(null);

  const go = async (kind: PlanKind | "portal") => {
    setBusy(kind);
    try {
      const fn = kind === "portal" ? portal : checkout;
      const args =
        kind === "portal"
          ? { origin: window.location.origin }
          : { origin: window.location.origin, interval: kind };
      const res = (await fn({ data: args as never })) as unknown as {
        url: string;
      };
      window.location.href = res.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      toast.error(
        msg.includes("BILLING_NOT_CONFIGURED")
          ? t("plan.notConfigured")
          : t("plan.error"),
      );
    } finally {
      setBusy(null);
    }
  };

  const features = [
    t("plan.feat1"),
    t("plan.feat2"),
    t("plan.feat3"),
    t("plan.feat4"),
  ];

  const cards: {
    kind: PlanKind;
    name: string;
    price: string;
    per: string;
    note?: string;
    highlight?: boolean;
  }[] = [
    {
      kind: "monthly",
      name: t("plan.monthly"),
      price: t("plan.monthlyPrice"),
      per: t("plan.perMonth"),
      note: t("plan.firstMonthNote"),
      highlight: true,
    },
    {
      kind: "annual",
      name: t("plan.annual"),
      price: t("plan.annualPrice"),
      per: t("plan.perYear"),
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
              {t("plan.title")}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">{t("plan.subtitle")}</p>
          </div>
          <div className="hidden sm:flex sm:flex-wrap items-center justify-end gap-2">
            <ClientSearchButton />
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="size-4" /> {t("plan.back")}
              </Button>
            </Link>
          </div>
          <div className="flex sm:hidden items-center">
            <MobileNav current="pricing" />
          </div>
        </header>

        <p className="mt-6 border-y-2 border-ink-muted px-4 py-3 text-sm text-ink-muted">
          {t("plan.trialNote")}
        </p>

        {planLoading ? (
          <div className="mt-6">
            <CardsSkeleton />
          </div>
        ) : (
          <div className="mt-6 grid gap-px border-y-2 border-ink-muted bg-rule md:grid-cols-2">
            {cards.map((c) => {
              const isCurrent = plan.isPro && plan.plan === c.kind;
              return (
                <div
                  key={c.kind}
                  className="flex flex-col bg-background px-6 py-8"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    {c.name}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-serif text-4xl text-ink tabular-nums">
                      {c.price}
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {c.per}
                    </span>
                  </div>
                  {c.note && (
                    <p className="mt-2 text-xs text-ink-faint">{c.note}</p>
                  )}
                  <ul className="mt-6 grow space-y-2.5">
                    {features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-ink-muted"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-health-hi" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {plan.unlimited ? (
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-health-hi">
                        {t("plan.unlimited")}
                      </p>
                    ) : isCurrent ? (
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                          {t("plan.current")}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy !== null}
                          onClick={() => go("portal")}
                        >
                          {t("plan.manage")}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <Link to="/checkout" search={{ interval: c.kind }}>
                          <Button variant={c.highlight ? "default" : "outline"}>
                            {t("plan.checkout")}
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy !== null}
                          onClick={() => go(c.kind)}
                        >
                          {t("plan.subscribe")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <PlanSwarm />
      </div>
    </main>
  );
}
