import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ClientSearchButton } from "@/components/clients/ClientSearchDialog";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePlan } from "@/hooks/usePlan";
import { createProCheckout } from "@/lib/billing.functions";
import type { PlanKind } from "@/lib/billing";

type CheckoutSearch = { interval: PlanKind };

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    interval: search["interval"] === "annual" ? "annual" : "monthly",
  }),
  head: () => ({
    meta: [
      { title: "Paiement — Mada Customer Software" },
      {
        name: "description",
        content:
          "Récapitulatif de l'abonnement Mada : 399 €/an ou 39,99 €/mois, clients illimités, export CSV/Excel et formule de score personnalisée.",
      },
      { property: "og:title", content: "Paiement — Mada Customer Software" },
      {
        property: "og:description",
        content: "Abonnement Mada, paiement sécurisé par Stripe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { t } = useI18n();
  const { interval } = Route.useSearch();
  const { plan } = usePlan();
  const checkout = useServerFn(createProCheckout);
  const [busy, setBusy] = useState(false);

  // A subscriptions row only exists once a checkout has ever been started — its absence
  // is the same signal the server uses to grant the trial + first-month discount.
  const isNewAccount = plan.plan === null && !plan.isPro;

  const pay = async () => {
    setBusy(true);
    try {
      const res = (await checkout({
        data: { origin: window.location.origin, interval },
      })) as unknown as { url: string };
      window.location.href = res.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      toast.error(
        msg.includes("BILLING_NOT_CONFIGURED")
          ? t("plan.notConfigured")
          : t("plan.error"),
      );
      setBusy(false);
    }
  };

  const features = [
    t("plan.feat1"),
    t("plan.feat2"),
    t("plan.feat3"),
    t("plan.feat4"),
  ];
  const isAnnual = interval === "annual";
  const price = isAnnual ? t("plan.annualPrice") : t("plan.monthlyPrice");
  const per = isAnnual ? t("plan.perYear") : t("plan.perMonth");
  const discountedFirstMonth = isNewAccount && !isAnnual;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
              {t("checkout.title")}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {t("checkout.subtitle")}
            </p>
          </div>
          <div className="hidden sm:flex sm:flex-wrap items-center justify-end gap-2">
            <ClientSearchButton />
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/pricing">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="size-4" /> {t("checkout.back")}
              </Button>
            </Link>
          </div>
          <div className="flex sm:hidden items-center">
            <MobileNav current="checkout" />
          </div>
        </header>

        {isNewAccount && (
          <p className="mt-6 border-y-2 border-ink-muted px-4 py-3 text-sm text-ink-muted">
            {t("plan.trialNote")}
          </p>
        )}

        <section className="mt-6 border-y-2 border-ink-muted">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint px-1 pt-4">
            {t("checkout.summary")}
          </div>

          <div className="flex items-baseline justify-between gap-4 px-1 py-5">
            <div>
              <div className="text-ink">
                {isAnnual ? t("plan.annual") : t("plan.monthly")}
              </div>
              <div className="mt-1 text-sm text-ink-muted">
                {isAnnual
                  ? t("checkout.billingAnnual")
                  : t("checkout.billingMonthly")}
              </div>
              {discountedFirstMonth && (
                <div className="mt-1 text-sm text-health-hi">
                  {t("checkout.firstMonthNote")}
                </div>
              )}
            </div>
            <div className="font-serif text-3xl tabular-nums text-ink">
              {discountedFirstMonth ? t("plan.firstMonthPrice") : price}
              <span className="ml-1 font-mono text-[11px] text-ink-faint">
                {per}
              </span>
            </div>
          </div>

          <div className="border-t border-rule px-1 py-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              {t("checkout.included")}
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
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
          </div>

          <div className="flex items-baseline justify-between border-t-2 border-ink-muted px-1 py-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              {t("checkout.total")}
            </span>
            <span className="font-mono text-xl tabular-nums text-ink">
              {isNewAccount
                ? t("checkout.dueToday")
                : discountedFirstMonth
                  ? t("plan.firstMonthPrice")
                  : price}
            </span>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" disabled={busy} onClick={pay}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )}{" "}
            {isNewAccount
              ? t("checkout.startTrial")
              : t("checkout.pay", { price })}
          </Button>
          <p className="font-mono text-[11px] text-ink-faint">
            {t("checkout.secure")}
          </p>
        </div>
        <p className="mt-2 text-xs text-ink-faint">{t("checkout.vat")}</p>
      </div>
    </main>
  );
}
