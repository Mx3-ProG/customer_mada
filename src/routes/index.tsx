import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n";
import { DocsSection } from "@/components/landing/DocsSection";
import { SiteFooter } from "@/components/layout/SiteFooter";

const OG_IMAGE = "/og-mada.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mada Customer Software — Santé client & rentabilité" },
      {
        name: "description",
        content:
          "Suivez vos clients Mada Customer Software : dates d'entrée, interactions, paiements, marge par produit et score de santé automatique.",
      },
      { property: "og:title", content: "Mada Customer Software — Santé client & rentabilité" },
      {
        property: "og:description",
        content:
          "Saisissez vos clients, suivez interactions, paiements et marges, et repérez les comptes à risque.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const stats = [
    [t("landing.stat1L"), t("landing.stat1V")],
    [t("landing.stat2L"), t("landing.stat2V")],
    [t("landing.stat3L"), t("landing.stat3V")],
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-8 py-14">
        <header className="flex items-center justify-between">
          <img
            src="/logo-mada.png"
            alt="Mada Customer Software"
            width={512}
            height={256}
            className="h-8 w-auto"
          />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <h1 className="mt-16 font-serif text-5xl leading-[1.05] tracking-tight text-ink">
          {t("landing.hero1")}
          <br />
          <span className="text-ink-muted">{t("landing.hero2")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          {t("landing.lead")}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to={signedIn ? "/dashboard" : "/auth"}
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {signedIn ? t("landing.openDashboard") : t("landing.signIn")}
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            {t("landing.privacy")}
          </span>
        </div>

        <dl className="mt-20 grid gap-px border-y-2 border-ink-muted bg-rule sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="bg-background px-5 py-6">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                {label}
              </dt>
              <dd className="mt-2 text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <DocsSection signedIn={signedIn} />
      </div>

      <SiteFooter />
    </main>
  );
}
