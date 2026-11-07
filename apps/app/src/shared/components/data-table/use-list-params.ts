'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

import type { FilterValues } from './types';

export const DEFAULT_PAGE_SIZE = 15;

interface UseListParamsOptions {
  /** Query-string keys for the table's filters; they become strings in the URL. */
  filterIds: readonly string[];
  defaultPerPage?: number;
}

/**
 * Filters, search, page and sort live in the URL so a view can be shared, bookmarked and
 * survives refresh. Any change other than page itself sends the user back to page 1.
 */
export function useListParams({
  filterIds,
  defaultPerPage = DEFAULT_PAGE_SIZE,
}: UseListParamsOptions) {
  const parsers = useMemo(
    () => ({
      search: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
      per_page: parseAsInteger.withDefault(defaultPerPage),
      sort: parseAsString,
      ...Object.fromEntries(filterIds.map((id) => [id, parseAsString])),
    }),
    [filterIds, defaultPerPage],
  );

  const [state, setState] = useQueryStates(parsers, { history: 'replace' });

  const filters: FilterValues = useMemo(() => {
    // Filter keys are dynamic, so read them through a plain record instead of the parser map's type.
    const values: Record<string, unknown> = state;
    return Object.fromEntries(
      filterIds.map((id) => [id, typeof values[id] === 'string' ? values[id] : null]),
    );
  }, [filterIds, state]);

  const setSearch = useCallback(
    (search: string) => setState({ search: search || null, page: null }),
    [setState],
  );
  const setFilter = useCallback(
    (id: string, value: string | null) => setState({ [id]: value, page: null }),
    [setState],
  );
  const setPage = useCallback(
    (page: number) => setState({ page: page > 1 ? page : null }),
    [setState],
  );
  const setPerPage = useCallback(
    (perPage: number) => setState({ per_page: perPage, page: null }),
    [setState],
  );
  const setSort = useCallback((sort: string | null) => setState({ sort, page: null }), [setState]);
  const clearFilters = useCallback(
    () => setState({ ...Object.fromEntries(filterIds.map((id) => [id, null])), page: null }),
    [filterIds, setState],
  );

  return {
    search: state.search,
    page: state.page,
    perPage: state.per_page,
    sort: state.sort,
    filters,
    setSearch,
    setFilter,
    setPage,
    setPerPage,
    setSort,
    clearFilters,
  };
}
