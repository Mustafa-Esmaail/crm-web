import type { QueryParams } from '@/lib/api/query-string';

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...teamKeys.lists(), params] as const,
};

/** Query-string keys the teams table filters on. */
export const TEAM_FILTER_IDS = ['department_id'] as const;

export const TEAM_STATUS = { active: 'active', inactive: 'inactive' } as const;

/** Columns the user may hide; `labelKey` points into the `teams.columns` messages. */
export const TEAM_TOGGLEABLE_COLUMNS = [
  { id: 'department', labelKey: 'department' },
  { id: 'leader', labelKey: 'leader' },
  { id: 'members_count', labelKey: 'members' },
  { id: 'status', labelKey: 'status' },
] as const;
