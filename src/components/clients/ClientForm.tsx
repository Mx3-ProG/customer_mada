import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateField } from "@/components/ui/date-field";
import { useSaveClient } from "@/hooks/useClients";
import type { Client, ClientDraft } from "@/lib/clients";
import { useI18n } from "@/i18n";

const today = () => new Date().toISOString().slice(0, 10);

const emptyDraft = (): ClientDraft => ({
  name: "",
  product: "",
  entry_date: today(),
  last_interaction_at: null,
  last_payment_at: null,
  next_payment_due: null,
  sale_price: 0,
  cost_price: 0,
  charges: 0,
  notes: null,
  sector: null,
  real_need: null,
  business_since: null,
  siret: null,
  phone: null,
  email: null,
  address: null,
  headquarters: null,
  website: null,
  google_business: null,
  social_links: null,
});

function toDraft(c: Client): ClientDraft {
  return {
    name: c.name,
    product: c.product ?? "",
    entry_date: c.entry_date,
    last_interaction_at: c.last_interaction_at,
    last_payment_at: c.last_payment_at,
    next_payment_due: c.next_payment_due,
    sale_price: Number(c.sale_price),
    cost_price: Number(c.cost_price),
    charges: Number(c.charges),
    notes: c.notes,
    sector: c.sector,
    real_need: c.real_need,
    business_since: c.business_since,
    siret: c.siret,
    phone: c.phone,
    email: c.email,
    address: c.address,
    headquarters: c.headquarters,
    website: c.website,
    google_business: c.google_business,
    social_links: c.social_links,
  };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-ink-faint">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-rule pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
      {children}
    </h3>
  );
}

const trim = (v: string | null, max: number) => {
  const t = (v ?? "").trim();
  return t ? t.slice(0, max) : null;
};

export function ClientForm({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<ClientDraft>(emptyDraft());
  const save = useSaveClient();

  useEffect(() => {
    if (open) setDraft(client ? toDraft(client) : emptyDraft());
  }, [open, client]);

  const set = <K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const text = (key: keyof ClientDraft, placeholder?: string, max = 200) => (
    <Input
      value={(draft[key] as string | null) ?? ""}
      maxLength={max}
      placeholder={placeholder}
      onChange={(e) => set(key, (e.target.value || null) as ClientDraft[typeof key])}
    />
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error(t("form.nameRequired"));
      return;
    }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      toast.error(t("form.emailInvalid"));
      return;
    }
    try {
      await save.mutateAsync({
        ...(client?.id ? { id: client.id } : {}),
        draft: {
          ...draft,
          name: draft.name.trim().slice(0, 120),
          product: trim(draft.product, 120),
          notes: trim(draft.notes, 1000),
          sector: trim(draft.sector, 120),
          real_need: trim(draft.real_need, 500),
          siret: trim(draft.siret, 20),
          phone: trim(draft.phone, 30),
          email: trim(draft.email, 255),
          address: trim(draft.address, 300),
          headquarters: trim(draft.headquarters, 300),
          website: trim(draft.website, 255),
          google_business: trim(draft.google_business, 255),
          social_links: trim(draft.social_links, 500),
        },
      });
      toast.success(client ? t("form.updated") : t("form.created"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("form.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {client ? t("form.editTitle") : t("form.newTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("form.desc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <SectionTitle>{t("form.sectionIdentity")}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("form.name")}>
                <Input
                  value={draft.name}
                  maxLength={120}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={t("form.namePh")}
                  required
                />
              </Field>
              <Field label={t("form.product")}>
                <Input
                  value={draft.product ?? ""}
                  maxLength={120}
                  onChange={(e) => set("product", e.target.value)}
                  placeholder={t("form.productPh")}
                />
              </Field>
              <Field label={t("form.sector")}>{text("sector", t("form.sectorPh"))}</Field>
              <Field label={t("form.siret")}>{text("siret", "123 456 789 00012", 20)}</Field>
              <Field label={t("form.businessSince")} hint={t("form.businessSinceHint")}>
                <DateField
                  value={draft.business_since}
                  onChange={(v) => set("business_since", v)}
                />
              </Field>
              <Field label={t("form.website")}>{text("website", "https://…", 255)}</Field>
            </div>
            <Field label={t("form.realNeed")}>
              <Textarea
                value={draft.real_need ?? ""}
                maxLength={500}
                rows={2}
                onChange={(e) => set("real_need", e.target.value || null)}
                placeholder={t("form.realNeedPh")}
              />
            </Field>
          </div>

          <div className="space-y-4">
            <SectionTitle>{t("form.sectionContact")}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("form.phone")}>{text("phone", "+261 …", 30)}</Field>
              <Field label={t("form.email")}>{text("email", "contact@exemple.com", 255)}</Field>
              <Field label={t("form.address")}>{text("address", t("form.addressPh"), 300)}</Field>
              <Field label={t("form.headquarters")}>{text("headquarters", t("form.hqPh"), 300)}</Field>
              <Field label={t("form.googleBusiness")} hint="https://…">
                {text("google_business", t("form.googleBusinessPh"), 255)}
              </Field>
              <Field label={t("form.social")} hint="https://… , https://…">
                {text("social_links", t("form.socialPh"), 500)}
              </Field>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>{t("form.sectionRelation")}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t("form.entryDate")}>
                <DateField
                  value={draft.entry_date}
                  clearable={false}
                  onChange={(v) => set("entry_date", v ?? today())}
                />
              </Field>
              <Field label={t("form.lastInteraction")}>
                <DateField
                  value={draft.last_interaction_at}
                  onChange={(v) => set("last_interaction_at", v)}
                />
              </Field>
              <Field label={t("form.lastPayment")}>
                <DateField
                  value={draft.last_payment_at}
                  onChange={(v) => set("last_payment_at", v)}
                />
              </Field>
              <Field label={t("form.nextPayment")}>
                <DateField
                  value={draft.next_payment_due}
                  onChange={(v) => set("next_payment_due", v)}
                />
              </Field>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>{t("form.sectionEconomy")}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t("form.salePrice")} hint={t("form.salePriceHint")}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.sale_price}
                  onChange={(e) => set("sale_price", Number(e.target.value))}
                />
              </Field>
              <Field label={t("form.costPrice")}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.cost_price}
                  onChange={(e) => set("cost_price", Number(e.target.value))}
                />
              </Field>
              <Field label={t("form.charges")} hint={t("form.chargesHint")}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.charges}
                  onChange={(e) => set("charges", Number(e.target.value))}
                />
              </Field>
            </div>
          </div>

          <Field label={t("form.notes")}>
            <Textarea
              value={draft.notes ?? ""}
              maxLength={1000}
              rows={3}
              onChange={(e) => set("notes", e.target.value)}
              placeholder={t("form.notesPh")}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t("common.saving") : client ? t("form.submitSave") : t("form.submitAdd")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
