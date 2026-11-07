'use client';

import { Activity, MapPin, Network, UserRound, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useBranchOptions } from '@/features/organization/branches';
import { useDepartmentOptions } from '@/features/organization/departments';
import { useTeamLookup } from '@/features/organization/teams';
import type { FilterDefinition } from '@/shared/components/data-table/types';

import { EMPLOYEE_STATUSES } from '../constants';
import { useEmployeeOptions } from './use-employee-options';
import { useEmployeeName } from './use-employee-queries';

/** The filter bar from the design: status, branch, department, team and direct manager. */
export function useEmployeeFilters(): FilterDefinition[] {
  const t = useTranslations('employees.filters');
  const tStatus = useTranslations('status');
  const branches = useBranchOptions();
  const departments = useDepartmentOptions();
  const teams = useTeamLookup();

  return useMemo(
    () => [
      {
        id: 'status',
        label: t('status'),
        icon: Activity,
        options: EMPLOYEE_STATUSES.map((status) => ({ value: status, label: tStatus(status) })),
      },
      {
        id: 'branch_id',
        label: t('branch'),
        icon: MapPin,
        options: branches.options,
        isLoading: branches.isLoading,
      },
      {
        id: 'department_id',
        label: t('department'),
        icon: Network,
        options: departments.options,
        isLoading: departments.isLoading,
      },
      {
        id: 'team_id',
        label: t('team'),
        icon: UsersRound,
        options: teams.options,
        isLoading: teams.isLoading,
      },
      {
        id: 'manager_id',
        label: t('manager'),
        icon: UserRound,
        options: [],
        // Managers are searched on the server: there can be far more than a page of them.
        useOptions: useEmployeeOptions,
        useSelectedLabel: useEmployeeName,
      },
    ],
    [t, tStatus, branches, departments, teams],
  );
}
