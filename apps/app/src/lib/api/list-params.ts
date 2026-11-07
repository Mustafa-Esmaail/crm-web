import type { QueryParams } from './query-string';

export interface ListQuery {
  search?: string;
  page?: number;
  perPage?: number;
  /** Column id; a leading "-" means descending, matching Laravel query-builder style. */
  sort?: string;
  filters?: QueryParams;
}

/** Builder: the one place a UI list state becomes Laravel's query parameters. */
export function buildListParams(query: ListQuery): QueryParams {
  return {
    ...query.filters,
    search: query.search,
    page: query.page && query.page > 1 ? query.page : undefined,
    per_page: query.perPage,
    sort: query.sort,
  };
}
