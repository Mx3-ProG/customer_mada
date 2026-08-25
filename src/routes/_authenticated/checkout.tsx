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
import { createProCheckout } from "@/lib/billing.functions";


export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Paiement — Mada Pro | Mada Customer Software" },
      {
        name: "description",
        content:
          "Récapitulatif de l'abonnement Mada Pro à 10 € par mois : clients illimités, export CSV/Excel et formule de score personnalisée.",
      },
      { property: "og:title", content: "Paiement — Mada Pro" },
      {
        property: "og:description",
        content: "Abonnement Mada Pro 10 €/mois, paiement sécurisé par Stripe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { t } = useI18n();
  const checkout = useServerFn(createProCheckout);
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true);
    try {
      const res = (await checkout({ data: { origin: window.location.origin } })) as unknown as {
        url: string;
      };
      window.location.href = res.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      toast.error(
        msg.includes("BILLING_NOT_CONFIGURED") ? t("plan.notConfigured") : t("plan.error"),
      );
      setBusy(false);
    }
  };

  const features = [t("plan.proFeat1"), t("plan.proFeat2"), t("plan.proFeat3"), t("plan.proFeat4")];

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
              {t("checkout.title")}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">{t("checkout.subtitle")}</p>
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


        <section className="mt-10 border-y-2 border-ink-muted">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint px-1 pt-4">
            {t("checkout.summary")}
          </div>

          <div className="flex items-baseline justify-between gap-4 px-1 py-5">
            <div>
              <div className="text-ink">{t("checkout.plan")}</div>
              <div className="mt-1 text-sm text-ink-muted">{t("checkout.billing")}</div>
            </div>
            <div className="font-serif text-3xl tabular-nums text-ink">
              {t("plan.proPrice")}
              <span className="ml-1 font-mono text-[11px] text-ink-faint">
                {t("plan.perMonth")}
              </span>
            </div>
          </div>

          <div className="border-t border-rule px-1 py-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              {t("checkout.included")}
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
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
            <span className="font-mono text-xl tabular-nums text-ink">{t("plan.proPrice")}</span>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" disabled={busy} onClick={pay}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}{" "}
            {t("checkout.pay", { price: t("plan.proPrice") })}
          </Button>
          <p className="font-mono text-[11px] text-ink-faint">{t("checkout.secure")}</p>
        </div>
        <p className="mt-2 text-xs text-ink-faint">{t("checkout.vat")}</p>
      </div>
    </main>
  );
}
