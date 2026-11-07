interface BarListProps {
  rows: { key: string; label: string; count: number }[];
  emptyLabel: string;
}

/** Horizontal bars scaled to the largest row; plain CSS so it mirrors in RTL for free. */
export function BarList({ rows, emptyLabel }: BarListProps) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (rows.length === 0) return <p className="text-small text-text-faint">{emptyLabel}</p>;

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key} className="space-y-1">
          <div className="text-small flex items-center justify-between gap-3">
            <span className="truncate">{row.label}</span>
            <span className="num text-muted-foreground">{row.count}</span>
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
