import { Skeleton } from '@crm/ui';

export function TableSkeletonRows({ rows, columns }: { rows: number; columns: number }) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <tr key={rowIndex} className="h-row border-b last:border-b-0">
      {Array.from({ length: columns }, (_, columnIndex) => (
        <td key={columnIndex} className="px-3">
          <Skeleton className="h-4 w-full max-w-40" />
        </td>
      ))}
    </tr>
  ));
}

export function CardGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}
