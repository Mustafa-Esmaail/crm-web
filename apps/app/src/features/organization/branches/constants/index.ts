import type { QueryParams } from '@/lib/api/query-string';

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...branchKeys.lists(), params] as const,
};

/** Query-string keys the branches table filters on. */
export const BRANCH_FILTER_IDS = ['is_active'] as const;

// is_active travels as 1/0 because Laravel's boolean rule rejects "true".
export const ACTIVE_FILTER_VALUE = '1';
export const INACTIVE_FILTER_VALUE = '0';

/** Columns the user may hide; `labelKey` points into the `branches.columns` messages. */
export const BRANCH_TOGGLEABLE_COLUMNS = [
  { id: 'city', labelKey: 'city' },
  { id: 'phone', labelKey: 'phone' },
  { id: 'manager', labelKey: 'manager' },
  { id: 'employees_count', labelKey: 'employees' },
  { id: 'status', labelKey: 'status' },
] as const;

export const BRANCH_STATUS = { active: 'active', inactive: 'inactive' } as const;
