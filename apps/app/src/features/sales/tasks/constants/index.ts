import type { QueryParams } from '@/lib/api/query-string';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...taskKeys.lists(), params] as const,
};

export const TASK_FILTER_IDS = ['status', 'priority', 'owner_id'] as const;
export const TASK_STATUSES = ['open', 'overdue', 'done'] as const;
export const TASK_PRIORITIES = ['high', 'normal', 'low'] as const;
export const TASK_DEFAULT_PAGE_SIZE = 15;
