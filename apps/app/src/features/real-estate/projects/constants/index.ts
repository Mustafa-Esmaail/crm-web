import type { QueryParams } from '@/lib/api/query-string';

export const projectKeys = {
  all: ['re-projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...projectKeys.lists(), params] as const,
};

export const PROJECT_FILTER_IDS = ['status'] as const;
export const PROJECT_DEFAULT_PAGE_SIZE = 15;
