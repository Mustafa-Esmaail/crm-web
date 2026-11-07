import { z } from 'zod';

import { EMPLOYEE_LOCALES } from '../constants';

const required = 'validation.required';
const maxLength = (max: number) => z.string().max(max, 'validation.maxLength');
const MIN_PASSWORD_LENGTH = 8;

// Mirrors EmployeeRequest; messages are i18n keys translated by FormField.
const baseFields = {
  name: z.string().trim().min(1, required).max(150, 'validation.maxLength'),
  email: z.string().trim().min(1, required).email('validation.email'),
  employee_code: maxLength(30),
  phone: maxLength(30),
  job_title: maxLength(150),
  locale: z.enum(EMPLOYEE_LOCALES),
  branch_id: z.string(),
  department_id: z.string(),
  team_id: z.string(),
  manager_id: z.string(),
  hired_at: z.string(),
  // The number field yields undefined when empty, so an optional rate is never sent as 0.
  commission_rate: z.number().min(0, 'validation.min').max(100, 'validation.max').optional(),
};

/** Creating needs a password; editing may leave it blank to keep the current one. */
export const createEmployeeSchema = z.object({
  ...baseFields,
  password: z.string().min(MIN_PASSWORD_LENGTH, 'validation.passwordTooShort'),
});

export const editEmployeeSchema = z.object({
  ...baseFields,
  password: z.string().refine((value) => value === '' || value.length >= MIN_PASSWORD_LENGTH, {
    message: 'validation.passwordTooShort',
  }),
});

export const offboardSchema = z.object({
  reassign_to: z.string(),
  reason: z.string().max(500, 'validation.maxLength'),
});

export type EmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type OffboardValues = z.infer<typeof offboardSchema>;
