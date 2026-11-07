import { Skeleton } from '@crm/ui';

/** Generic page placeholder: a header block and a content block, shown while a route suspends. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}
