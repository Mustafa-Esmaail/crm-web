import { paginatedSchema, resourceSchema, summarySchema } from '@crm/api-client';
import { z } from 'zod';

// Fields behind field-level permissions may be absent or null, so they are nullish.
export const employeeSchema = z.object({
  id: z.number(),
  employee_code: z.string().nullish(),
  name: z.string(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  job_title: z.string().nullish(),
  status: z.string(),
  is_owner: z.boolean(),
  locale: z.string().nullish(),
  hired_at: z.string().nullish(),
  // Laravel serialises decimals as strings.
  commission_rate: z.union([z.number(), z.string()]).nullish(),
  branch: summarySchema.nullish(),
  department: summarySchema.nullish(),
  team: summarySchema.nullish(),
  manager: summarySchema.nullish(),
  direct_reports_count: z.number().optional(),
  last_login_at: z.string().nullish(),
  created_at: z.string().nullish(),
});

export const employeeListSchema = paginatedSchema(employeeSchema);
export const employeeResponseSchema = resourceSchema(employeeSchema);

// POST/PUT answer with a model that was not refreshed after saving, so `status` and `is_owner`
// come back null. Writes only need to know it succeeded; the lists refetch the real record.
export const employeeSavedSchema = resourceSchema(z.object({ id: z.number() }));

export type Employee = z.infer<typeof employeeSchema>;
