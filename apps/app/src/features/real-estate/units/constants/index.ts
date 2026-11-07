import type { QueryParams } from '@/lib/api/query-string';

export const unitKeys = {
  all: ['re-units'] as const,
  lists: () => [...unitKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...unitKeys.lists(), params] as const,
  interests: (unitId: number) => [...unitKeys.all, unitId, 'interests'] as const,
  media: (unitId: number) => [...unitKeys.all, unitId, 'media'] as const,
};

/** The API keeps at most this many files per unit (config real_estate.media_max_per_unit). */
export const UNIT_MEDIA_LIMIT = 30;
/** Matches UploadUnitMediaRequest's max:10240 (kilobytes). */
export const UNIT_MEDIA_MAX_BYTES = 10 * 1024 * 1024;

export const UNIT_FILTER_IDS = ['project_id', 'type', 'status'] as const;
export const UNIT_DEFAULT_PAGE_SIZE = 15;
