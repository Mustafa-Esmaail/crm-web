import type { ReactNode } from 'react';

interface BarListRow {
  key: string;
  label: string;
  count: number;
  /** Extra figure next to the count, e.g. the total value of the deals. */
  detail?: ReactNode;
}

interface BarListProps {
  rows: BarListRow[];
  emptyLabel: string;
}

/** Horizontal bars scaled to the largest row; plain CSS so it mirrors in RTL for free. */
export function BarList({ rows, emptyLabel }: BarListProps) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (rows.length === 0 || total === 0) {
    return <p className="text-small text-text-faint">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key} className="space-y-1">
          <div className="text-small flex items-center justify-between gap-3">
            <span className="truncate">{row.label}</span>
            <span className="text-muted-foreground flex shrink-0 items-center gap-2">
              {row.detail && <span className="text-caption">{row.detail}</span>}
              <span className="num text-foreground font-medium">{row.count}</span>
              <span className="num text-caption w-10 text-end">
                {Math.round((row.count / total) * 100)}%
              </span>
            </span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
