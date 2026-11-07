import type { QueryParams } from '@/lib/api/query-string';

export const auditKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...auditKeys.lists(), params] as const,
};

/** `auditable_type` values exactly as the API stores them. */
export const AUDITABLE_TYPE = {
  employee: 'employee',
  branch: 'branch',
  department: 'department',
  team: 'team',
} as const;
