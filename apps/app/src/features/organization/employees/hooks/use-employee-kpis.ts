'use client';

import { useQueries } from '@tanstack/react-query';

import { useBranchesCount } from '@/features/organization/branches';
import { useTeamsCount } from '@/features/organization/teams';
import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getEmployees } from '../api/employee-requests';
import { EMPLOYEE_STATUS, employeeKeys } from '../constants';

export interface EmployeeKpis {
  total: number | undefined;
  active: number | undefined;
  suspended: number | undefined;
  teams: number | undefined;
  branches: number | undefined;
  /** Share of employees that are active, 0-100. */
  activePercent: number | undefined;
  isLoading: boolean;
}

/**
 * The API has no statistics endpoint, so each counter is a one-row list request read for its
 * `meta.total`. Cheap, cached, and refreshed with the rest of the employees data.
 */
export function useEmployeeKpis(): EmployeeKpis {
  const http = useHttpClient();
  const teams = useTeamsCount();
  const branches = useBranchesCount();

  const [total, active, suspended] = useQueries({
    queries: [undefined, EMPLOYEE_STATUS.active, EMPLOYEE_STATUS.suspended].map((status) => {
      const params = buildListParams({ perPage: 1, filters: { status } });
      return {
        queryKey: [...employeeKeys.kpis(), status ?? 'all'],
        queryFn: ({ signal }: { signal: AbortSignal }) => getEmployees(http, params, signal),
        select: (response: Awaited<ReturnType<typeof getEmployees>>) => response.meta.total,
      };
    }),
  });

  const totalCount = total?.data;
  const activeCount = active?.data;

  return {
    total: totalCount,
    active: activeCount,
    suspended: suspended?.data,
    teams: teams.total,
    branches: branches.total,
    activePercent:
      totalCount && activeCount !== undefined
        ? Math.round((activeCount / totalCount) * 100)
        : undefined,
    isLoading: Boolean(total?.isLoading || active?.isLoading || suspended?.isLoading),
  };
}
