import type { ClientMetrics } from "@/lib/clients";

/** Shared "sort by score rule / margin" logic for the dashboard and superadmin client tables. */
export type SortKey =
  | "score"
  | "interaction"
  | "payments"
  | "profitability"
  | "loyalty"
  | "monthlyPayment"
  | "margin";

export const SORT_KEYS: SortKey[] = [
  "score",
  "interaction",
  "payments",
  "profitability",
  "loyalty",
  "monthlyPayment",
  "margin",
];

/** Most sort keys default to ascending (worst first) — margin defaults to descending (most profitable first). */
export const defaultDirFor = (key: SortKey): "asc" | "desc" =>
  key === "margin" ? "desc" : "asc";

export function sortValue(m: ClientMetrics, key: SortKey): number {
  if (key === "score") return m.score;
  if (key === "margin") return m.margin;
  return m.drivers.find((d) => d.key === key)?.points ?? 0;
}
