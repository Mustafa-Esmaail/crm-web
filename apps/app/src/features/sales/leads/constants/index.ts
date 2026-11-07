import type { QueryParams } from '@/lib/api/query-string';

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...leadKeys.lists(), params] as const,
  detail: (id: number) => [...leadKeys.all, 'detail', id] as const,
  activities: (id: number) => [...leadKeys.all, 'activities', id] as const,
  // Stage and source names come back in the reader's language.
  stages: (locale: string) => [...leadKeys.all, 'stages', locale] as const,
  sources: (locale: string) => [...leadKeys.all, 'sources', locale] as const,
};

/** Query-string keys the leads table filters on; `unassigned` travels as 1 (Laravel's boolean rule). */
export const LEAD_FILTER_IDS = [
  'stage_id',
  'source_id',
  'owner_id',
  'team_id',
  'unassigned',
] as const;
export const UNASSIGNED_VALUE = '1';

export const LEAD_DEFAULT_PAGE_SIZE = 15;

/** What a salesperson can log against a lead; keys match the API's `type` enum. */
export const ACTIVITY_TYPES = ['note', 'call', 'meeting', 'whatsapp', 'email'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Allowed phone shape, as the API validates it. */
export const PHONE_PATTERN = /^\+?[0-9]{6,20}$/;
