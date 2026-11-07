'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams } from '@/lib/api/list-params';
import type { AsyncOptionsResult } from '@/shared/components/form/async-select-field';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getEmployees } from '../api/employee-requests';
import { ACTIVE_EMPLOYEE_STATUS, EMPLOYEE_OPTIONS_PAGE_SIZE, employeeKeys } from '../constants';

/**
 * Searchable list of active employees for pickers (manager, leader, transfer-to…).
 * Only active people qualify: the API rejects inactive ones for these relations.
 */
export function useEmployeeOptions(search: string, excludeId?: number): AsyncOptionsResult {
  const http = useHttpClient();
  const params = buildListParams({
    search,
    perPage: EMPLOYEE_OPTIONS_PAGE_SIZE,
    filters: { status: ACTIVE_EMPLOYEE_STATUS },
  });

  const query = useQuery({
    queryKey: employeeKeys.list({ ...params, purpose: 'options' }),
    queryFn: ({ signal }) => getEmployees(http, params, signal),
    placeholderData: keepPreviousData,
  });

  return {
    options: (query.data?.data ?? [])
      .filter((employee) => employee.id !== excludeId)
      .map((employee) => ({
        value: String(employee.id),
        label: employee.job_title ? `${employee.name} · ${employee.job_title}` : employee.name,
      })),
    isLoading: query.isLoading,
  };
}
