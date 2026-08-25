import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { getLegalDoc, type LegalKey } from "@/lib/legal";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LegalPage({ docKey }: { docKey: LegalKey }) {
  const { locale } = useI18n();
  const doc = getLegalDoc(docKey, locale);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-8 pb-16">
        <header className="flex items-center justify-between pt-10">
          <Link to="/">
            <img src="/logo-mada.png" alt="Mada Customer Software" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <article className="mt-14">
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-ink">
            {doc.title}
          </h1>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {locale === "fr" ? "Mise à jour" : "Last updated"} — {doc.updated}
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">{doc.intro}</p>

          {doc.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-serif text-xl text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-2">
                {section.body.map((line) => (
                  <p key={line} className="text-[14px] leading-relaxed text-ink-muted">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
      <SiteFooter />
    </main>
  );
}
