import { useI18n } from "@/i18n";
import type { Driver } from "@/lib/clients";

const pointsClass = (points: number) =>
  points > 0 ? "text-health-hi" : points < 0 ? "text-alarm" : "text-ink-faint";

const formatPoints = (points: number) =>
  points > 0 ? `+${points}` : String(points);

/** Row-by-row breakdown of a client's score — reused in the detail dialog and the chart tooltip. */
export function ScoreBreakdown({
  drivers,
  dense,
}: {
  drivers: Driver[];
  dense?: boolean;
}) {
  const { t } = useI18n();
  return (
    <ul className={dense ? "space-y-0.5" : "space-y-1.5"}>
      {drivers.map((d) => (
        <li
          key={d.key}
          className={`flex items-center justify-between gap-4 ${dense ? "text-[11px]" : "text-sm"}`}
        >
          <span className={dense ? "text-ink-faint" : "text-ink-muted"}>
            {t(`driver.${d.key}` as never)}
          </span>
          <span className={`font-mono tabular-nums ${pointsClass(d.points)}`}>
            {formatPoints(d.points)}
          </span>
        </li>
      ))}
    </ul>
  );
}
