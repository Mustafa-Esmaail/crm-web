'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getDepartments, getDepartmentTree } from '../api/department-requests';
import { departmentKeys } from '../constants';

export function useDepartmentsQuery(query: ListQuery) {
  const http = useHttpClient();
  const params = buildListParams(query);

  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: ({ signal }) => getDepartments(http, params, signal),
    placeholderData: keepPreviousData,
  });
}

/** The whole nested tree; it also feeds the parent pickers, so forms and the tree share one fetch. */
export function useDepartmentTreeQuery() {
  const http = useHttpClient();

  return useQuery({
    queryKey: departmentKeys.tree(),
    queryFn: ({ signal }) => getDepartmentTree(http, signal),
    select: (response) => response.data,
  });
}
