import { emptyToNull, idOrNull } from '@/lib/utils/strings';

import type { EmployeeFormValues, OffboardValues } from '../schemas';
import type { Employee } from '../types';

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  name: '',
  email: '',
  password: '',
  employee_code: '',
  phone: '',
  job_title: '',
  locale: 'ar',
  branch_id: '',
  department_id: '',
  team_id: '',
  manager_id: '',
  hired_at: '',
  commission_rate: undefined,
};

function toRate(value: Employee['commission_rate']): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const rate = Number(value);
  return Number.isFinite(rate) ? rate : undefined;
}

/** API resource -> form values. The password is never returned, so it always starts blank. */
export function toEmployeeFormValues(employee: Employee): EmployeeFormValues {
  return {
    name: employee.name,
    email: employee.email ?? '',
    password: '',
    employee_code: employee.employee_code ?? '',
    phone: employee.phone ?? '',
    job_title: employee.job_title ?? '',
    locale: employee.locale === 'en' ? 'en' : 'ar',
    branch_id: employee.branch ? String(employee.branch.id) : '',
    department_id: employee.department ? String(employee.department.id) : '',
    team_id: employee.team ? String(employee.team.id) : '',
    manager_id: employee.manager ? String(employee.manager.id) : '',
    hired_at: employee.hired_at ?? '',
    commission_rate: toRate(employee.commission_rate),
  };
}

/**
 * Form values -> request body. The email is lower-cased because the API's rule rejects capitals,
 * and a blank password is left out on edit so it keeps the current one.
 */
export function toEmployeePayload(values: EmployeeFormValues) {
  const { password, ...rest } = values;

  return {
    name: rest.name.trim(),
    email: rest.email.trim().toLowerCase(),
    ...(password ? { password } : {}),
    employee_code: emptyToNull(rest.employee_code),
    phone: emptyToNull(rest.phone),
    job_title: emptyToNull(rest.job_title),
    locale: rest.locale,
    branch_id: idOrNull(rest.branch_id),
    department_id: idOrNull(rest.department_id),
    team_id: idOrNull(rest.team_id),
    manager_id: idOrNull(rest.manager_id),
    hired_at: emptyToNull(rest.hired_at),
    commission_rate: rest.commission_rate ?? null,
  };
}

export function toOffboardPayload(values: OffboardValues) {
  return { reassign_to: idOrNull(values.reassign_to), reason: emptyToNull(values.reason) };
}

/** Owners are protected by the API (they cannot be suspended or offboarded). */
export function canChangeStatus(employee: Employee): boolean {
  return !employee.is_owner;
}

export function getJobSubtitle(employee: Employee): string {
  return employee.job_title ?? '';
}
