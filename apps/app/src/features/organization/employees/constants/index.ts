import type { QueryParams } from '@/lib/api/query-string';

/** Query-key factory: one place decides what "the same query" means for the cache. */
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: QueryParams) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
  subordinates: (id: number) => [...employeeKeys.all, 'subordinates', id] as const,
  kpis: () => [...employeeKeys.all, 'kpis'] as const,
};

export const EMPLOYEE_OPTIONS_PAGE_SIZE = 20;

/** Statuses exactly as the API's UserStatus enum issues them. */
export const EMPLOYEE_STATUS = { active: 'active', suspended: 'suspended', left: 'left' } as const;
export const ACTIVE_EMPLOYEE_STATUS = EMPLOYEE_STATUS.active;
export const EMPLOYEE_STATUSES = Object.values(EMPLOYEE_STATUS);

export const EMPLOYEE_LOCALES = ['ar', 'en'] as const;

/** Query-string keys the employees table filters on. */
export const EMPLOYEE_FILTER_IDS = [
  'status',
  'branch_id',
  'department_id',
  'team_id',
  'manager_id',
  'include_sub_departments',
] as const;

export const EMPLOYEE_DEFAULT_PAGE_SIZE = 10;
export const INCLUDE_SUB_DEPARTMENTS_ON = '1';

/** Columns the user may hide; `labelKey` points into the `employees.columns` messages. */
export const EMPLOYEE_TOGGLEABLE_COLUMNS = [
  { id: 'code', labelKey: 'code' },
  { id: 'department', labelKey: 'department' },
  { id: 'team', labelKey: 'team' },
  { id: 'branch', labelKey: 'branch' },
  { id: 'status', labelKey: 'status' },
  { id: 'last_login', labelKey: 'lastLogin' },
] as const;

export const EMPLOYEE_PROFILE_TABS = [
  'overview',
  'subordinates',
  'deals',
  'roles',
  'activity',
] as const;
export type EmployeeProfileTab = (typeof EMPLOYEE_PROFILE_TABS)[number];
