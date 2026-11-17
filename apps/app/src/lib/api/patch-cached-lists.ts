import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Patches one record in every cached page under `listsKey`, so a change shows before the server
 * answers. Callers still invalidate afterwards; that refetch is the source of truth.
 */
export async function patchCachedLists<T extends { id: number }>(
  queryClient: QueryClient,
  listsKey: QueryKey,
  id: number,
  patch: Partial<T>,
) {
  await queryClient.cancelQueries({ queryKey: listsKey });
  queryClient.setQueriesData<{ data: T[] }>({ queryKey: listsKey }, (page) =>
    page
      ? { ...page, data: page.data.map((item) => (item.id === id ? { ...item, ...patch } : item)) }
      : page,
  );
}
