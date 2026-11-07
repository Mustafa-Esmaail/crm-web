'use client';

import { CircleDot, Megaphone, UserRound, UserRoundX, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useEmployeeName, useEmployeeOptions } from '@/features/organization/employees';
import { useTeamLookup } from '@/features/organization/teams';
import type { FilterDefinition } from '@/shared/components/data-table/types';

import { UNASSIGNED_VALUE } from '../constants';
import { useLeadSources, useLeadStages } from './use-lead-queries';

/** Stage, source, owner, team, and a "no owner yet" chip for leads waiting to be handed out. */
export function useLeadFilters(): FilterDefinition[] {
  const t = useTranslations('leads.filters');
  const stages = useLeadStages();
  const sources = useLeadSources();
  const teams = useTeamLookup();

  return useMemo(
    () => [
      {
        id: 'stage_id',
        label: t('stage'),
        icon: CircleDot,
        options: (stages.data ?? []).map((stage) => ({
          value: String(stage.id),
          label: stage.name,
        })),
        isLoading: stages.isLoading,
      },
      {
        id: 'source_id',
        label: t('source'),
        icon: Megaphone,
        options: (sources.data ?? []).map((source) => ({
          value: String(source.id),
          label: source.name,
        })),
        isLoading: sources.isLoading,
      },
      {
        id: 'owner_id',
        label: t('owner'),
        icon: UserRound,
        options: [],
        // Owners are searched on the server: there can be far more than a page of them.
        useOptions: useEmployeeOptions,
        useSelectedLabel: useEmployeeName,
      },
      {
        id: 'team_id',
        label: t('team'),
        icon: UsersRound,
        options: teams.options,
        isLoading: teams.isLoading,
      },
      {
        id: 'unassigned',
        label: t('assignment'),
        icon: UserRoundX,
        options: [{ value: UNASSIGNED_VALUE, label: t('unassigned') }],
      },
    ],
    [
      t,
      stages.data,
      stages.isLoading,
      sources.data,
      sources.isLoading,
      teams.options,
      teams.isLoading,
    ],
  );
}
