/**
 * Modèle de données client + calcul du score de santé.
 * Les pondérations et les seuils sont paramétrables (table score_settings) :
 * récence de l'interaction, tenue des paiements, rentabilité, fidélité.
 */

/** How a client economics amount recurs — drives its monthly-equivalent value in the score/margin math. */
export type PaymentFrequency = "monthly" | "one_time";

/** A one-time amount is spread over this many months to get its monthly-equivalent value. */
export const ONE_TIME_SPREAD_MONTHS = 12;

/** Normalizes an amount to its monthly-equivalent value for margin/score calculations. */
export function monthlyEquivalent(
  amount: number,
  frequency: PaymentFrequency,
): number {
  return frequency === "one_time" ? amount / ONE_TIME_SPREAD_MONTHS : amount;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  product: string | null;
  entry_date: string;
  last_interaction_at: string | null;
  last_payment_at: string | null;
  next_payment_due: string | null;
  sale_price: number;
  sale_price_frequency: PaymentFrequency;
  cost_price: number;
  cost_price_frequency: PaymentFrequency;
  charges: number;
  charges_frequency: PaymentFrequency;
  notes: string | null;
  sector: string | null;
  real_need: string | null;
  business_since: string | null;
  siret: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  headquarters: string | null;
  website: string | null;
  google_business: string | null;
  social_links: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientDraft = {
  name: string;
  product: string | null;
  entry_date: string;
  last_interaction_at: string | null;
  last_payment_at: string | null;
  next_payment_due: string | null;
  sale_price: number;
  sale_price_frequency: PaymentFrequency;
  cost_price: number;
  cost_price_frequency: PaymentFrequency;
  charges: number;
  charges_frequency: PaymentFrequency;
  notes: string | null;
  sector: string | null;
  real_need: string | null;
  business_since: string | null;
  siret: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  headquarters: string | null;
  website: string | null;
  google_business: string | null;
  social_links: string | null;
};

export interface ScoreSettings {
  interaction_grace_days: number;
  interaction_days_per_point: number;
  interaction_max_penalty: number;
  interaction_missing_penalty: number;
  overdue_points_per_day: number;
  overdue_max_penalty: number;
  no_payment_penalty: number;
  no_payment_after_days: number;
  margin_good_rate: number;
  margin_ok_rate: number;
  margin_ok_penalty: number;
  margin_low_penalty: number;
  margin_negative_penalty: number;
  no_price_penalty: number;
  loyalty_days: number;
  loyalty_bonus: number;
  monthly_payment_bonus: number;
  risk_threshold: number;
  alarm_threshold: number;
}

export const DEFAULT_SETTINGS: ScoreSettings = {
  interaction_grace_days: 14,
  interaction_days_per_point: 3,
  interaction_max_penalty: 35,
  interaction_missing_penalty: 25,
  overdue_points_per_day: 2,
  overdue_max_penalty: 40,
  no_payment_penalty: 15,
  no_payment_after_days: 30,
  margin_good_rate: 0.4,
  margin_ok_rate: 0.2,
  margin_ok_penalty: 5,
  margin_low_penalty: 15,
  margin_negative_penalty: 30,
  no_price_penalty: 10,
  loyalty_days: 365,
  loyalty_bonus: 5,
  monthly_payment_bonus: 5,
  risk_threshold: 55,
  alarm_threshold: 40,
};

/** Stable key for each score rule — translate with `t(`driver.${key}`)`. */
export type DriverKey =
  "interaction" | "payments" | "profitability" | "loyalty" | "monthlyPayment";

export interface Driver {
  key: DriverKey;
  points: number;
}

export interface ClientMetrics {
  margin: number;
  marginRate: number;
  daysSinceInteraction: number | null;
  daysSinceEntry: number;
  paymentOverdueDays: number;
  score: number;
  drivers: Driver[];
}

const DAY = 24 * 60 * 60 * 1000;

export function daysBetween(
  iso: string | null,
  from = new Date(),
): number | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((from.getTime() - d.getTime()) / DAY);
}

/** Jours restants avant une date (négatif = en retard). */
export function daysUntil(
  iso: string | null,
  from = new Date(),
): number | null {
  const past = daysBetween(iso, from);
  return past === null ? null : -past;
}

export function computeMetrics(
  c: Client,
  settings: ScoreSettings = DEFAULT_SETTINGS,
  now = new Date(),
): ClientMetrics {
  const s = settings;
  // Amounts are normalized to a monthly-equivalent before comparison, so a one-time
  // payment (spread over ONE_TIME_SPREAD_MONTHS) and a monthly one weigh the same in the margin.
  const saleMonthly = monthlyEquivalent(
    c.sale_price ?? 0,
    c.sale_price_frequency,
  );
  const costMonthly = monthlyEquivalent(
    c.cost_price ?? 0,
    c.cost_price_frequency,
  );
  const chargesMonthly = monthlyEquivalent(c.charges ?? 0, c.charges_frequency);
  const margin = saleMonthly - costMonthly - chargesMonthly;
  const marginRate = saleMonthly > 0 ? margin / saleMonthly : 0;

  const daysSinceInteraction = daysBetween(c.last_interaction_at, now);
  const daysSinceEntry = daysBetween(c.entry_date, now) ?? 0;
  const untilDue = daysUntil(c.next_payment_due, now);
  const paymentOverdueDays = untilDue !== null && untilDue < 0 ? -untilDue : 0;

  const drivers: Driver[] = [];

  // 1. Récence de la dernière interaction
  let interaction: number;
  if (daysSinceInteraction === null) {
    interaction = -s.interaction_missing_penalty;
  } else if (daysSinceInteraction <= s.interaction_grace_days) {
    interaction = 0;
  } else {
    const per =
      s.interaction_days_per_point > 0 ? s.interaction_days_per_point : 1;
    interaction = -Math.min(
      s.interaction_max_penalty,
      Math.round((daysSinceInteraction - s.interaction_grace_days) / per),
    );
  }
  drivers.push({ key: "interaction", points: interaction });

  // 2. Tenue des paiements
  let payment = 0;
  if (paymentOverdueDays > 0) {
    payment = -Math.min(
      s.overdue_max_penalty,
      paymentOverdueDays * s.overdue_points_per_day,
    );
    payment = -Math.round(-payment);
  } else if (!c.last_payment_at && daysSinceEntry > s.no_payment_after_days) {
    payment = -s.no_payment_penalty;
  }
  drivers.push({ key: "payments", points: payment });

  // 3. Rentabilité
  let profitability: number;
  if (saleMonthly <= 0) profitability = -s.no_price_penalty;
  else if (marginRate >= s.margin_good_rate) profitability = 0;
  else if (marginRate >= s.margin_ok_rate) profitability = -s.margin_ok_penalty;
  else if (marginRate >= 0) profitability = -s.margin_low_penalty;
  else profitability = -s.margin_negative_penalty;
  drivers.push({ key: "profitability", points: profitability });

  // 4. Fidélité
  const loyalty = daysSinceEntry >= s.loyalty_days ? s.loyalty_bonus : 0;
  drivers.push({ key: "loyalty", points: loyalty });

  // 5. Régularité du paiement — un client qui règle son prix d'achat mensuellement
  // gagne ce bonus, sans toucher au calcul des retards (driver n°2 ci-dessus).
  const monthlyPayment =
    c.sale_price_frequency === "monthly" ? s.monthly_payment_bonus : 0;
  drivers.push({ key: "monthlyPayment", points: monthlyPayment });

  const raw = 100 + drivers.reduce((acc, d) => acc + d.points, 0);
  const score = Math.max(5, Math.min(99, Math.round(raw)));

  return {
    margin,
    marginRate,
    daysSinceInteraction,
    daysSinceEntry,
    paymentOverdueDays,
    score,
    drivers,
  };
}

export function scoreTone(
  score: number,
  settings: ScoreSettings = DEFAULT_SETTINGS,
): "alarm" | "warm" | "ok" {
  if (score < settings.alarm_threshold) return "alarm";
  if (score < settings.risk_threshold) return "warm";
  return "ok";
}

/** Locale utilisée par les formatteurs — pilotée par le provider i18n. */
let formatLocale = "fr-FR";
let eur = new Intl.NumberFormat(formatLocale, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function setFormatLocale(locale: string): void {
  formatLocale = locale;
  eur = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function formatMoney(value: number): string {
  return eur.format(value ?? 0);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(formatLocale, {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function formatAgo(
  days: number | null,
  labels: { today: string; dayShort: string } = {
    today: "aujourd'hui",
    dayShort: "j",
  },
): string {
  if (days === null) return "—";
  if (days <= 0) return labels.today;
  return `${days} ${labels.dayShort}`;
}

/** Couleur continue encodant la santé, résolue en oklch par le navigateur. */
export function healthColor(
  score: number,
  settings: ScoreSettings = DEFAULT_SETTINGS,
): string {
  const risk = settings.risk_threshold;
  const alarm = settings.alarm_threshold;
  const h = Math.max(0, Math.min(100, score));
  const mix = (from: string, to: string, t: number) =>
    `color-mix(in oklch, ${to} ${(Math.max(0, Math.min(1, t)) * 100).toFixed(1)}%, ${from})`;
  if (h >= risk)
    return mix(
      "var(--health-lo)",
      "var(--health-hi)",
      (h - risk) / (100 - risk || 1),
    );
  if (h >= alarm)
    return mix(
      "var(--health-lo)",
      "var(--health-warm)",
      (risk - h) / (risk - alarm || 1),
    );
  return mix("var(--health-warm)", "var(--alarm)", (alarm - h) / (alarm || 1));
}
