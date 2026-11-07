import type { QueryParams } from '@/lib/api/query-string';

export const dealKeys = {
  all: ['deals'] as const,
  detail: (id: number) => [...dealKeys.all, 'detail', id] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...dealKeys.lists(), params] as const,
  // Stage names come back in the reader's language.
  pipeline: (locale: string) => [...dealKeys.all, 'pipeline', locale] as const,
};

/** Query-string keys the deals views filter on. */
export const DEAL_FILTER_IDS = ['stage_id', 'status', 'owner_id'] as const;

export const DEAL_VIEWS = ['board', 'list'] as const;
export type DealView = (typeof DEAL_VIEWS)[number];

/** What `status` can be, exactly as the API accepts it. */
export const DEAL_STATUSES = ['open', 'won', 'lost'] as const;

export const DEAL_DEFAULT_PAGE_SIZE = 15;

/** The API caps a page at 100; the board shows that many deals at most. */
export const DEAL_BOARD_LIMIT = 100;
