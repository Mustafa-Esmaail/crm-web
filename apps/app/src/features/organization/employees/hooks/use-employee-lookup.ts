'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getEmployees } from '../api/employee-requests';
import { employeeKeys } from '../constants';
import type { Employee } from '../types';

// The API caps a page at 100; beyond that names would show as ids, which is an acceptable fallback.
const LOOKUP_PAGE_SIZE = 100;

/** Employees by id, for turning ids found in audit entries back into names. */
export function useEmployeeLookup(): Map<number, Employee> {
  const http = useHttpClient();
  const params = buildListParams({ perPage: LOOKUP_PAGE_SIZE });

  const query = useQuery({
    queryKey: employeeKeys.list({ ...params, purpose: 'lookup' }),
    queryFn: ({ signal }) => getEmployees(http, params, signal),
    staleTime: 60_000,
  });

  return useMemo(
    () => new Map((query.data?.data ?? []).map((employee) => [employee.id, employee])),
    [query.data],
  );
}
