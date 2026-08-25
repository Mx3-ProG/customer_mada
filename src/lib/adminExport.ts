import * as XLSX from "xlsx";
import type { TranslationKey } from "@/i18n/locales/en";
import { computeMetrics, type ScoreSettings } from "@/lib/clients";
import type { AdminClientRow } from "@/lib/admin.functions";

export type ExportColumn = {
  id: string;
  label: TranslationKey;
  value: (row: AdminClientRow, settings: ScoreSettings, isActive: boolean) => string | number;
};

const txt = (v: string | null | undefined) => v ?? "";

export const EXPORT_COLUMNS: ExportColumn[] = [
  { id: "owner", label: "col.owner", value: (r) => r.owner_email },
  { id: "name", label: "form.name", value: (r) => r.name },
  { id: "product", label: "form.product", value: (r) => txt(r.product) },
  { id: "sector", label: "form.sector", value: (r) => txt(r.sector) },
  { id: "real_need", label: "form.realNeed", value: (r) => txt(r.real_need) },
  { id: "siret", label: "form.siret", value: (r) => txt(r.siret) },
  { id: "business_since", label: "form.businessSince", value: (r) => txt(r.business_since) },
  { id: "phone", label: "form.phone", value: (r) => txt(r.phone) },
  { id: "email", label: "form.email", value: (r) => txt(r.email) },
  { id: "address", label: "form.address", value: (r) => txt(r.address) },
  { id: "headquarters", label: "form.headquarters", value: (r) => txt(r.headquarters) },
  { id: "website", label: "form.website", value: (r) => txt(r.website) },
  { id: "google_business", label: "form.googleBusiness", value: (r) => txt(r.google_business) },
  { id: "social_links", label: "form.social", value: (r) => txt(r.social_links) },
  { id: "entry_date", label: "form.entryDate", value: (r) => r.entry_date },
  { id: "last_interaction_at", label: "form.lastInteraction", value: (r) => txt(r.last_interaction_at) },
  { id: "last_payment_at", label: "form.lastPayment", value: (r) => txt(r.last_payment_at) },
  { id: "next_payment_due", label: "form.nextPayment", value: (r) => txt(r.next_payment_due) },
  { id: "sale_price", label: "form.salePrice", value: (r) => Number(r.sale_price) },
  { id: "cost_price", label: "form.costPrice", value: (r) => Number(r.cost_price) },
  { id: "charges", label: "form.charges", value: (r) => Number(r.charges) },
  { id: "margin", label: "col.margin", value: (r, s) => computeMetrics(r, s).margin },
  {
    id: "margin_rate",
    label: "col.marginRate",
    value: (r, s) => Math.round(computeMetrics(r, s).marginRate * 1000) / 10,
  },
  { id: "score", label: "col.score", value: (r, s) => computeMetrics(r, s).score },
  {
    id: "status",
    label: "col.status",
    value: (_r, _s, isActive) => (isActive ? "active" : "inactive"),
  },
  { id: "notes", label: "form.notes", value: (r) => txt(r.notes) },
  { id: "created_at", label: "col.createdAt", value: (r) => r.created_at.slice(0, 10) },
];

export const DEFAULT_EXPORT_COLUMNS = [
  "owner",
  "name",
  "product",
  "sector",
  "entry_date",
  "last_interaction_at",
  "last_payment_at",
  "sale_price",
  "cost_price",
  "charges",
  "margin",
  "score",
  "status",
];

export type Kpi = { label: string; value: string | number };

export function buildTable(
  rows: AdminClientRow[],
  columnIds: string[],
  settings: ScoreSettings,
  isActive: (row: AdminClientRow) => boolean,
  label: (key: TranslationKey) => string,
): (string | number)[][] {
  const cols = EXPORT_COLUMNS.filter((c) => columnIds.includes(c.id));
  return [
    cols.map((c) => label(c.label)),
    ...rows.map((r) => cols.map((c) => c.value(r, settings, isActive(r)))),
  ];
}

const yieldToUi = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });

/**
 * Builds the export table in chunks, yielding to the browser between each chunk
 * so the UI stays responsive on thousands of rows.
 */
export async function buildTableAsync(
  rows: AdminClientRow[],
  columnIds: string[],
  settings: ScoreSettings,
  isActive: (row: AdminClientRow) => boolean,
  label: (key: TranslationKey) => string,
  onProgress?: (ratio: number) => void,
  chunkSize = 250,
): Promise<(string | number)[][]> {
  const cols = EXPORT_COLUMNS.filter((c) => columnIds.includes(c.id));
  const table: (string | number)[][] = [cols.map((c) => label(c.label))];

  for (let i = 0; i < rows.length; i += chunkSize) {
    for (const r of rows.slice(i, i + chunkSize)) {
      table.push(cols.map((c) => c.value(r, settings, isActive(r))));
    }
    onProgress?.(Math.min(1, (i + chunkSize) / Math.max(1, rows.length)));
    await yieldToUi();
  }
  onProgress?.(1);
  return table;
}


function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const clean = (cell: string | number) => {
  if (typeof cell === "number") {
    // French/European Excel expects a comma decimal separator.
    return Number.isInteger(cell) ? String(cell) : String(cell).replace(".", ",");
  }
  return String(cell ?? "")
    .replace(/\r?\n|\t/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

function toCsv(table: (string | number)[][]): string {
  return table
    .map((line) =>
      line
        .map((cell) => {
          const v = clean(cell);
          return /[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(";"),
    )
    .join("\r\n");
}

export function exportCsv(table: (string | number)[][], kpis: Kpi[] | null, filename: string) {
  // `sep=;` tells Excel which delimiter to use, so the file opens as real columns.
  let csv = "sep=;\r\n" + toCsv(table);
  if (kpis?.length) {
    csv += "\r\n\r\n" + toCsv(kpis.map((k) => [k.label, k.value]));
  }
  download(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
}

function autoWidths(table: (string | number)[][]) {
  const cols = table[0]?.length ?? 0;
  return Array.from({ length: cols }, (_, i) => ({
    wch: Math.min(
      40,
      Math.max(10, ...table.map((row) => String(row[i] ?? "").length + 2)),
    ),
  }));
}

export function exportXlsx(
  table: (string | number)[][],
  kpis: Kpi[] | null,
  sheetName: string,
  kpiSheetName: string,
  filename: string,
) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(table);
  ws["!cols"] = autoWidths(table);
  ws["!freeze"] = { xSplit: "0", ySplit: "1" };
  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(0, table.length - 1), c: Math.max(0, (table[0]?.length ?? 1) - 1) },
    }),
  };
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30));
  if (kpis?.length) {
    const kws = XLSX.utils.aoa_to_sheet(kpis.map((k) => [k.label, k.value]));
    kws["!cols"] = [{ wch: 28 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, kws, kpiSheetName.slice(0, 30));
  }
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  download(
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}.xlsx`,
  );
}

