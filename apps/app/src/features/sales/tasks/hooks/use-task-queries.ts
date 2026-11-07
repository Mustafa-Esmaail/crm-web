'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getTasks } from '../api/task-requests';
import { taskKeys } from '../constants';

export interface TaskListQuery {
  search: string;
  page: number;
  perPage: number;
  status?: string | null;
  priority?: string | null;
  ownerId?: string | null;
  relatedType?: string | null;
  relatedId?: number | null;
}

export function useTasksQuery(query: TaskListQuery) {
  const http = useHttpClient();
  const params = buildListParams({
    search: query.search,
    page: query.page,
    perPage: query.perPage,
    filters: {
      status: query.status,
      priority: query.priority,
      owner_id: query.ownerId,
      related_type: query.relatedType,
      related_id: query.relatedId ? String(query.relatedId) : null,
    },
  });

  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: ({ signal }) => getTasks(http, params, signal),
    placeholderData: keepPreviousData,
  });
}
