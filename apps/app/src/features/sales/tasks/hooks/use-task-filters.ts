'use client';

import { Activity, Flag, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useEmployeeName, useEmployeeOptions } from '@/features/organization/employees';
import type { FilterDefinition } from '@/shared/components/data-table/types';

import { TASK_PRIORITIES, TASK_STATUSES } from '../constants';

export function useTaskFilters(): FilterDefinition[] {
  const t = useTranslations('tasks.filters');

  return useMemo(
    () => [
      {
        id: 'status',
        label: t('status'),
        icon: Activity,
        options: TASK_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
      {
        id: 'priority',
        label: t('priority'),
        icon: Flag,
        options: TASK_PRIORITIES.map((value) => ({ value, label: t(`priorities.${value}`) })),
      },
      {
        id: 'owner_id',
        label: t('owner'),
        icon: UserRound,
        options: [],
        useOptions: useEmployeeOptions,
        useSelectedLabel: useEmployeeName,
      },
    ],
    [t],
  );
}
