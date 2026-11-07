'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { useBranchOptions } from '@/features/organization/branches';
import { useDepartmentLookup } from '@/features/organization/departments';
import { useTeamLookup } from '@/features/organization/teams';

import { useEmployeeLookup } from './use-employee-lookup';

/**
 * Audit entries store raw ids (`team_id: 5`), but a person reads names. This returns a function
 * that swaps an id for the name of the record it points at, or undefined when it can't tell.
 */
export function useAuditValueResolver() {
  const teams = useTeamLookup();
  const departments = useDepartmentLookup();
  const branches = useBranchOptions();
  const employees = useEmployeeLookup();
  const tStatus = useTranslations('status');

  return useCallback(
    (field: string, value: unknown): string | undefined => {
      if (typeof value !== 'number' && typeof value !== 'string') return undefined;

      // Status values are words, not ids, so they are translated before the id lookups below.
      if (field === 'status')
        return tStatus.has(String(value)) ? tStatus(String(value)) : undefined;

      const id = Number(value);
      if (!Number.isFinite(id)) return undefined;

      switch (field) {
        case 'team_id':
          return teams.teams.find((team) => team.id === id)?.name;
        case 'department_id':
          return departments.get(id)?.name;
        case 'branch_id':
          return branches.options.find((option) => option.value === String(id))?.label;
        case 'manager_id':
          return employees.get(id)?.name;
        default:
          return undefined;
      }
    },
    [teams.teams, departments, branches.options, employees, tStatus],
  );
}
