import { paginatedSchema, resourceSchema, type Summary, summarySchema } from '@crm/api-client';
import { z } from 'zod';

/** Written out (not inferred) because the type refers to itself through `children`. */
export interface Department {
  id: number;
  parent_id: number | null;
  name: string;
  name_ar: string;
  name_en?: string | null;
  code?: string | null;
  is_active: boolean;
  branch?: Summary | null;
  manager?: Summary | null;
  employees_count?: number;
  children?: Department[];
  created_at?: string | null;
}

export const departmentSchema: z.ZodType<Department> = z.lazy(() =>
  z.object({
    id: z.number(),
    parent_id: z.number().nullable(),
    name: z.string(),
    name_ar: z.string(),
    name_en: z.string().nullish(),
    code: z.string().nullish(),
    is_active: z.boolean(),
    branch: summarySchema.nullish(),
    manager: summarySchema.nullish(),
    employees_count: z.number().optional(),
    children: z.array(departmentSchema).optional(),
    created_at: z.string().nullish(),
  }),
);

export const departmentListSchema = paginatedSchema(departmentSchema);
export const departmentTreeSchema = z.object({ data: z.array(departmentSchema) });
export const departmentResponseSchema = resourceSchema(departmentSchema);
