import { Skeleton } from "@/components/ui/skeleton";
import { BrandLoader } from "@/components/BrandLoader";

/** Rows + header placeholder for any data table. */
export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="border-y-2 border-ink-muted py-3" aria-hidden>
      <div className="flex items-center gap-4 border-b border-rule py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-rule/60 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" style={{ opacity: 1 - r * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Strip of KPI tiles. */
export function KpiSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-px border-y-2 border-ink-muted bg-rule md:grid-cols-5"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-background px-4 py-5">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-3 h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Card grid placeholder (pricing, checkout). */
export function CardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-rule p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-32" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-full" />
            ))}
          </div>
          <Skeleton className="mt-6 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Full-page placeholder used while a route resolves. */
export function RouteSkeleton() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>

        <div className="mt-8">
          <KpiSkeleton />
        </div>

        <div className="mt-10 flex justify-center">
          <BrandLoader size={44} />
        </div>

        <div className="mt-10">
          <TableSkeleton />
        </div>
      </div>
    </main>
  );
}
