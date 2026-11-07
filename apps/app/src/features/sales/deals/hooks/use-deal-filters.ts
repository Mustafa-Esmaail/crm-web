'use client';

import { Activity, CircleDot, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useEmployeeName, useEmployeeOptions } from '@/features/organization/employees';
import type { FilterDefinition } from '@/shared/components/data-table/types';

import { DEAL_STATUSES } from '../constants';
import { useDealPipeline } from './use-deal-queries';

/** Stage, open/won/lost status, and owner; the same chips drive both the board and the list. */
export function useDealFilters(): FilterDefinition[] {
  const t = useTranslations('deals.filters');
  const pipeline = useDealPipeline();

  return useMemo(
    () => [
      {
        id: 'stage_id',
        label: t('stage'),
        icon: CircleDot,
        options: (pipeline.data ?? []).map((stage) => ({
          value: String(stage.id),
          label: stage.name,
        })),
        isLoading: pipeline.isLoading,
      },
      {
        id: 'status',
        label: t('status'),
        icon: Activity,
        options: DEAL_STATUSES.map((status) => ({ value: status, label: t(`statuses.${status}`) })),
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
    [t, pipeline.data, pipeline.isLoading],
  );
}
