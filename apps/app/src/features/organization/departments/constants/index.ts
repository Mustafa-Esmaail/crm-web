import type { QueryParams } from '@/lib/api/query-string';

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...departmentKeys.lists(), params] as const,
  tree: () => [...departmentKeys.all, 'tree'] as const,
};

export const DEPARTMENT_VIEWS = ['tree', 'list'] as const;
export type DepartmentView = (typeof DEPARTMENT_VIEWS)[number];

/** Query-string keys the departments list filters on. */
export const DEPARTMENT_FILTER_IDS = ['branch_id'] as const;

export const DEPARTMENT_STATUS = { active: 'active', inactive: 'inactive' } as const;
