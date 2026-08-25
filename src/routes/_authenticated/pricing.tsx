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

import { PlanSwarm } from "@/components/pricing/PlanSwarm";
import { CardsSkeleton } from "@/components/skeletons/PageSkeletons";
import { createProCheckout, createBillingPortal } from "@/lib/billing.functions";


export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — Mada Customer Software" },
      {
        name: "description",
        content:
          "Gratuit jusqu'à 30 clients, puis 10 € par mois pour des clients illimités, l'export CSV/Excel et la formule de score personnalisée.",
      },
      { property: "og:title", content: "Tarifs — Mada Customer Software" },
      {
        property: "og:description",
        content: "Freemium : 30 clients offerts, puis 10 €/mois pour tout débloquer.",
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
  const [busy, setBusy] = useState(false);

  const go = async (kind: "checkout" | "portal") => {
    setBusy(true);
    try {
      const fn = kind === "checkout" ? checkout : portal;
      const res = (await fn({ data: { origin: window.location.origin } })) as unknown as {
        url: string;
      };
      window.location.href = res.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      toast.error(
        msg.includes("BILLING_NOT_CONFIGURED") ? t("plan.notConfigured") : t("plan.error"),
      );
    } finally {
      setBusy(false);
    }
  };

  const cards = [
    {
      name: t("plan.free"),
      price: t("plan.freePrice"),
      features: [t("plan.freeFeat1"), t("plan.freeFeat2"), t("plan.freeFeat3")],
      current: !plan.isPro,
    },
    {
      name: t("plan.pro"),
      price: t("plan.proPrice"),
      features: [t("plan.proFeat1"), t("plan.proFeat2"), t("plan.proFeat3"), t("plan.proFeat4")],
      current: plan.isPro,
      highlight: true,
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


        {planLoading ? (
          <div className="mt-10">
            <CardsSkeleton />
          </div>
        ) : (
          <div className="mt-10 grid gap-px border-y-2 border-ink-muted bg-rule md:grid-cols-2">
          {cards.map((c) => (

            <div key={c.name} className="flex flex-col bg-background px-6 py-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                {c.name}
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-serif text-4xl text-ink tabular-nums">{c.price}</span>
                {c.highlight && (
                  <span className="font-mono text-[11px] text-ink-faint">{t("plan.perMonth")}</span>
                )}
              </div>
              <ul className="mt-6 grow space-y-2.5">
                {c.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-health-hi" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.unlimited && c.highlight ? (
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-health-hi">
                    {t("plan.unlimited")}
                  </p>
                ) : c.current ? (
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                      {t("plan.current")}
                    </span>
                    {c.highlight && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => go("portal")}
                      >
                        {t("plan.manage")}
                      </Button>
                    )}
                  </div>
                ) : c.highlight ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to="/checkout">
                      <Button>{t("plan.checkout")}</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => go("checkout")}
                    >
                      {t("plan.upgrade")}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          </div>
        )}


        <PlanSwarm />
      </div>
    </main>
  );
}
