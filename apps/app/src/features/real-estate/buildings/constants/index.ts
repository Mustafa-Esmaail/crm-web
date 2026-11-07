import type { QueryParams } from '@/lib/api/query-string';

export const buildingKeys = {
  all: ['re-buildings'] as const,
  list: (params: QueryParams) => [...buildingKeys.all, 'list', params] as const,
};

export const BUILDING_FILTER_IDS = ['project_id'] as const;
export const BUILDING_DEFAULT_PAGE_SIZE = 15;
