'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getEmployee, getEmployees, getSubordinates } from '../api/employee-requests';
import { employeeKeys } from '../constants';

export function useEmployeesQuery(query: ListQuery) {
  const http = useHttpClient();
  const params = buildListParams(query);

  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: ({ signal }) => getEmployees(http, params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeQuery(id: number | undefined) {
  const http = useHttpClient();

  return useQuery({
    queryKey: employeeKeys.detail(id ?? 0),
    queryFn: ({ signal }) => getEmployee(http, id ?? 0, signal),
    enabled: id !== undefined && Number.isFinite(id),
    select: (response) => response.data,
  });
}

export function useSubordinatesQuery(id: number) {
  const http = useHttpClient();

  return useQuery({
    queryKey: employeeKeys.subordinates(id),
    queryFn: ({ signal }) => getSubordinates(http, id, signal),
    select: (response) => response.data,
  });
}

/** Display name for an id held in the URL (e.g. the "direct manager" filter after a reload). */
export function useEmployeeName(value: string | null | undefined): string | undefined {
  const id = value ? Number(value) : undefined;
  return useEmployeeQuery(id).data?.name;
}
