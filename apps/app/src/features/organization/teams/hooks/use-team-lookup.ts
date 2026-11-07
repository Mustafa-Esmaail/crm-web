'use client';

import { useQuery } from '@tanstack/react-query';

import { buildListParams } from '@/lib/api/list-params';
import type { SelectOption } from '@/shared/components/form/field-types';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getTeams } from '../api/team-requests';
import { teamKeys } from '../constants';
import type { Team } from '../types';

// The API caps a page at 100; beyond that a searchable picker would be needed.
const LOOKUP_PAGE_SIZE = 100;
const NO_TEAMS: Team[] = [];

/** Every team, for pickers and for resolving a team's department when one is chosen. */
export function useTeamLookup(): { teams: Team[]; options: SelectOption[]; isLoading: boolean } {
  const http = useHttpClient();
  const params = buildListParams({ perPage: LOOKUP_PAGE_SIZE });

  const query = useQuery({
    queryKey: teamKeys.list({ ...params, purpose: 'lookup' }),
    queryFn: ({ signal }) => getTeams(http, params, signal),
  });

  const teams = query.data?.data ?? NO_TEAMS;
  return {
    teams,
    // Team names repeat across departments ("Team A" in each), so the department disambiguates.
    options: teams.map((team) => ({
      value: String(team.id),
      label: team.department ? `${team.name} · ${team.department.name}` : team.name,
    })),
    isLoading: query.isLoading,
  };
}

/** Total number of teams, for dashboard-style counters. */
export function useTeamsCount(): { total: number | undefined; isLoading: boolean } {
  const http = useHttpClient();
  const params = buildListParams({ perPage: 1 });

  const query = useQuery({
    queryKey: teamKeys.list({ ...params, purpose: 'count' }),
    queryFn: ({ signal }) => getTeams(http, params, signal),
    select: (response) => response.meta.total,
  });

  return { total: query.data, isLoading: query.isLoading };
}
