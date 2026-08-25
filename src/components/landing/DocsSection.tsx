import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";

type Item = { t: string; b: string };

function Section({
  id,
  index,
  title,
  lead,
  items,
}: {
  id: string;
  index: string;
  title: string;
  lead: string;
  items: Item[];
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t-2 border-ink-muted pt-8">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          {index}
        </span>
        <h3 className="font-serif text-2xl tracking-tight text-ink">{title}</h3>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{lead}</p>
      <dl className="mt-6 grid gap-px bg-rule sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.t} className="bg-background px-5 py-5">
            <dt className="text-sm font-medium text-ink">{it.t}</dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{it.b}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function DocsSection({ signedIn }: { signedIn: boolean }) {
  const { t } = useI18n();

  const groups = [
    {
      id: "getting-started",
      index: "01",
      title: t("docs.start.title"),
      lead: t("docs.start.lead"),
      items: [
        { t: t("docs.start.s1t"), b: t("docs.start.s1b") },
        { t: t("docs.start.s2t"), b: t("docs.start.s2b") },
        { t: t("docs.start.s3t"), b: t("docs.start.s3b") },
        { t: t("docs.start.s4t"), b: t("docs.start.s4b") },
      ],
    },
    {
      id: "health-score",
      index: "02",
      title: t("docs.score.title"),
      lead: t("docs.score.lead"),
      items: [
        { t: t("docs.score.i1t"), b: t("docs.score.i1b") },
        { t: t("docs.score.i2t"), b: t("docs.score.i2b") },
        { t: t("docs.score.i3t"), b: t("docs.score.i3b") },
        { t: t("docs.score.i4t"), b: t("docs.score.i4b") },
      ],
    },
    {
      id: "optimize",
      index: "03",
      title: t("docs.opt.title"),
      lead: t("docs.opt.lead"),
      items: [
        { t: t("docs.opt.o1t"), b: t("docs.opt.o1b") },
        { t: t("docs.opt.o2t"), b: t("docs.opt.o2b") },
        { t: t("docs.opt.o3t"), b: t("docs.opt.o3b") },
        { t: t("docs.opt.o4t"), b: t("docs.opt.o4b") },
      ],
    },
  ];

  const faq = [
    { q: t("docs.faq.q1"), a: t("docs.faq.a1") },
    { q: t("docs.faq.q2"), a: t("docs.faq.a2") },
    { q: t("docs.faq.q3"), a: t("docs.faq.a3") },
  ];

  return (
    <section id="docs" className="mt-24 scroll-mt-8">
      <h2 className="font-serif text-3xl tracking-tight text-ink">{t("docs.title")}</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        {t("docs.subtitle")}
      </p>

      <nav aria-label={t("docs.tocLabel")} className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        {[...groups.map((g) => ({ id: g.id, label: g.title })), { id: "faq", label: t("docs.faq.title") }].map(
          (l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint underline-offset-4 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ),
        )}
      </nav>

      <div className="mt-10 space-y-12">
        {groups.map((g) => (
          <Section key={g.id} {...g} />
        ))}

        <section id="faq" className="scroll-mt-8 border-t-2 border-ink-muted pt-8">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">04</span>
            <h3 className="font-serif text-2xl tracking-tight text-ink">{t("docs.faq.title")}</h3>
          </div>
          <div className="mt-6 divide-y divide-rule border-y border-rule">
            {faq.map((f) => (
              <details key={f.q} className="group px-1 py-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink marker:hidden">
                  <span className="mr-2 font-mono text-ink-faint group-open:hidden">+</span>
                  <span className="mr-2 hidden font-mono text-ink-faint group-open:inline">−</span>
                  {f.q}
                </summary>
                <p className="mt-2 pl-5 text-[13px] leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-14 border-y-2 border-ink-muted px-5 py-8">
        <h3 className="font-serif text-2xl tracking-tight text-ink">{t("docs.cta.title")}</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">{t("docs.cta.body")}</p>
        <Link
          to={signedIn ? "/dashboard" : "/auth"}
          className="mt-5 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {signedIn ? t("docs.cta.button") : t("landing.signIn")}
        </Link>
      </div>
    </section>
  );
}
