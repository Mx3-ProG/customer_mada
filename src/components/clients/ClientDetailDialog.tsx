import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n";
import {
  computeMetrics,
  formatDate,
  formatMoney,
  scoreTone,
  DEFAULT_SETTINGS,
  type Client,
  type ScoreSettings,
} from "@/lib/clients";
import { ScoreBreakdown } from "@/components/clients/ScoreBreakdown";

const toneClass = {
  ok: "text-health-hi",
  warm: "text-health-warm",
  alarm: "text-alarm",
} as const;

const linkClass =
  "inline-flex items-center gap-1 text-sm text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-health-hi";

function toUrl(raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(v))
    return `https://${v}`;
  return `https://www.google.com/search?q=${encodeURIComponent(v)}`;
}

function Field({
  label,
  value,
  href,
  kind,
}: {
  label: string;
  value: string | null | undefined;
  href?: (v: string) => string;
  /** "list" splits the value on commas / newlines / spaces into several links. */
  kind?: "list";
}) {
  const raw = value?.trim();
  const head = (
    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
      {label}
    </div>
  );

  if (!raw) {
    return (
      <div>
        {head}
        <div className="mt-1 break-words text-sm text-ink">—</div>
      </div>
    );
  }

  if (!href) {
    return (
      <div>
        {head}
        <div className="mt-1 break-words text-sm text-ink">{raw}</div>
      </div>
    );
  }

  const parts = kind === "list" ? raw.split(/[\s,;]+/).filter(Boolean) : [raw];

  return (
    <div>
      {head}
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {parts.map((p) => {
          const url = href(p);
          const external = /^https?:/i.test(url);
          return (
            <a
              key={p}
              href={url}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={`${linkClass} break-all`}
            >
              {p}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/** Phone with one-tap call, WhatsApp and SMS actions. */
function PhoneField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const { t } = useI18n();
  const raw = value?.trim();
  const head = (
    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
      {label}
    </div>
  );
  if (!raw) {
    return (
      <div>
        {head}
        <div className="mt-1 text-sm text-ink">—</div>
      </div>
    );
  }
  const tel = raw.replace(/[^\d+]/g, "");
  const wa = tel.replace(/\D/g, "");
  const actions: {
    key: string;
    label: string;
    href: string;
    external?: boolean;
  }[] = [
    { key: "call", label: t("contact.call"), href: `tel:${tel}` },
    {
      key: "wa",
      label: t("contact.whatsapp"),
      href: `https://wa.me/${wa}`,
      external: true,
    },
    { key: "sms", label: t("contact.sms"), href: `sms:${tel}` },
  ];
  return (
    <div>
      {head}
      <a
        href={`tel:${tel}`}
        className={`mt-1 inline-block ${linkClass} break-all`}
      >
        {raw}
      </a>
      <div className="mt-2 flex flex-wrap gap-2">
        {actions.map((a) => (
          <a
            key={a.key}
            href={a.href}
            {...(a.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="border border-rule px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-health-hi hover:text-health-hi"
          >
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Read-only client record (superadmin view). */
export function ClientDetailDialog({
  client,
  ownerLabel,
  subtitle,
  open,
  onOpenChange,
  settings = DEFAULT_SETTINGS,
}: {
  client: Client | null;
  ownerLabel?: string | undefined;
  subtitle?: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: ScoreSettings;
}) {
  const { t } = useI18n();
  if (!client) return null;
  const m = computeMetrics(client, settings);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {client.name}{" "}
            <span
              className={`ml-2 font-mono text-lg ${toneClass[scoreTone(m.score, settings)]}`}
            >
              {m.score}
            </span>
          </DialogTitle>
          <DialogDescription>
            {subtitle ?? t("admin.detailReadonly")}
            {ownerLabel ? ` · ${ownerLabel}` : ""}
          </DialogDescription>
        </DialogHeader>

        <section className="mt-2 border-y-2 border-ink-muted py-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("score.why")}
          </h3>
          <div className="mt-3">
            <ScoreBreakdown drivers={m.drivers} />
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("form.sectionIdentity")}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label={t("form.product")} value={client.product} />
            <Field label={t("form.sector")} value={client.sector} />
            <Field label={t("form.siret")} value={client.siret} />
            <Field
              label={t("form.businessSince")}
              value={formatDate(client.business_since)}
            />
            <Field label={t("form.realNeed")} value={client.real_need} />
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("form.sectionContact")}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <PhoneField label={t("form.phone")} value={client.phone} />
            <Field
              label={t("form.email")}
              value={client.email}
              href={(v) => `mailto:${v}`}
            />
            <Field
              label={t("form.address")}
              value={client.address}
              href={(v) =>
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`
              }
            />
            <Field
              label={t("form.headquarters")}
              value={client.headquarters}
              href={(v) =>
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`
              }
            />
            <Field
              label={t("form.website")}
              value={client.website}
              href={toUrl}
            />
            <Field
              label={t("form.googleBusiness")}
              value={client.google_business}
              href={toUrl}
            />
            <Field
              label={t("form.social")}
              value={client.social_links}
              href={toUrl}
              kind="list"
            />
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("form.sectionRelation")}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field
              label={t("form.entryDate")}
              value={formatDate(client.entry_date)}
            />
            <Field
              label={t("form.lastInteraction")}
              value={formatDate(client.last_interaction_at)}
            />
            <Field
              label={t("form.lastPayment")}
              value={formatDate(client.last_payment_at)}
            />
            <Field
              label={t("form.nextPayment")}
              value={formatDate(client.next_payment_due)}
            />
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("form.sectionEconomy")}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field
              label={t("form.salePrice")}
              value={formatMoney(Number(client.sale_price))}
            />
            <Field
              label={t("form.costPrice")}
              value={formatMoney(Number(client.cost_price))}
            />
            <Field
              label={t("form.charges")}
              value={formatMoney(Number(client.charges))}
            />
            <Field
              label={t("col.margin")}
              value={`${formatMoney(m.margin)} (${Math.round(m.marginRate * 100)}%)`}
            />
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {t("form.notes")}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
            {client.notes?.trim() || "—"}
          </p>
        </section>
      </DialogContent>
    </Dialog>
  );
}
