'use client';

import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';

interface TrendPoint {
  date: string;
  count: number;
}

interface TrendChartProps {
  points: TrendPoint[];
  /** Period bounds (yyyy-mm-dd) so quiet days show as zero instead of being skipped. */
  from?: string | null;
  to?: string | null;
  emptyLabel: string;
  /** Accessible name, e.g. "New leads per day". */
  label: string;
}

const MAX_DAILY_COLUMNS = 92;
const HEIGHT = 160;

function parseDay(date: string): Date {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Fills the days between the bounds with zeros; long ranges are summed per month to stay readable. */
function buildSeries(points: TrendPoint[], from?: string | null, to?: string | null) {
  if (points.length === 0) return { buckets: [], monthly: false };

  const byDay = new Map(points.map((point) => [point.date.slice(0, 10), point.count]));
  const sorted = [...byDay.keys()].sort();
  const start = parseDay(from ?? sorted[0] ?? '');
  const end = parseDay(to ?? sorted.at(-1) ?? '');
  const days: TrendPoint[] = [];

  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = dayKey(cursor);
    days.push({ date: key, count: byDay.get(key) ?? 0 });
  }

  if (days.length <= MAX_DAILY_COLUMNS) return { buckets: days, monthly: false };

  const months = new Map<string, number>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    months.set(key, (months.get(key) ?? 0) + day.count);
  }
  return {
    buckets: [...months].map(([month, count]) => ({ date: `${month}-01`, count })),
    monthly: true,
  };
}

/**
 * One series over time as thin columns from a shared baseline. Hovering (or focusing) a column
 * shows its date and value; a hidden table carries the same numbers for screen readers.
 */
export function TrendChart({ points, from, to, emptyLabel, label }: TrendChartProps) {
  const locale = useLocale();
  const [active, setActive] = useState<number | null>(null);
  const { buckets, monthly } = useMemo(() => buildSeries(points, from, to), [points, from, to]);

  const formatDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(
      locale,
      monthly ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' },
    );
    return (date: string) => formatter.format(parseDay(date));
  }, [locale, monthly]);
  const formatNumber = useMemo(() => new Intl.NumberFormat(locale).format, [locale]);

  if (buckets.length === 0 || buckets.every((bucket) => bucket.count === 0)) {
    return <p className="text-small text-text-faint py-10 text-center">{emptyLabel}</p>;
  }

  const max = Math.max(...buckets.map((bucket) => bucket.count));
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const current = active === null ? null : buckets[active];
  const labelEvery = Math.max(1, Math.ceil(buckets.length / 6));

  return (
    <figure className="space-y-2">
      <div className="text-small flex h-5 items-center justify-between gap-2">
        {current ? (
          <span>
            <span className="text-muted-foreground">{formatDate(current.date)}: </span>
            <span className="num font-semibold">{formatNumber(current.count)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            <span className="num text-foreground font-semibold">{formatNumber(total)}</span>
          </span>
        )}
        <span className="text-caption text-text-faint num">{formatNumber(max)}</span>
      </div>

      <div
        className="border-border relative flex items-end gap-0.5 border-b"
        style={{ height: HEIGHT }}
        onMouseLeave={() => setActive(null)}
        role="img"
        aria-label={label}
      >
        {[0.5, 1].map((ratio) => (
          <div
            key={ratio}
            aria-hidden
            className="border-border/60 pointer-events-none absolute inset-x-0 border-t border-dashed"
            style={{ bottom: HEIGHT * ratio - 1 }}
          />
        ))}
        {buckets.map((bucket, index) => (
          <div
            key={bucket.date}
            className="group relative flex h-full flex-1 cursor-default items-end"
            onMouseEnter={() => setActive(index)}
          >
            <div
              className={
                active === index
                  ? 'bg-primary w-full rounded-t-sm'
                  : 'bg-primary/70 group-hover:bg-primary w-full rounded-t-sm'
              }
              style={{
                height: bucket.count === 0 ? 0 : Math.max(2, (bucket.count / max) * (HEIGHT - 8)),
              }}
            />
          </div>
        ))}
      </div>

      <div className="text-caption text-text-faint flex gap-0.5" aria-hidden>
        {buckets.map((bucket, index) => (
          <span key={bucket.date} className="flex-1 overflow-visible text-center whitespace-nowrap">
            {index % labelEvery === 0 ? formatDate(bucket.date) : ''}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {buckets
            .filter((bucket) => bucket.count > 0)
            .map((bucket) => (
              <tr key={bucket.date}>
                <th scope="row">{formatDate(bucket.date)}</th>
                <td>{bucket.count}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </figure>
  );
}
