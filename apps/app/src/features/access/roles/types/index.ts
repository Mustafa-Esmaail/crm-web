import { resourceSchema } from '@crm/api-client';
import { z } from 'zod';

export const roleSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullable(),
  description: z.string().nullable(),
  is_system: z.boolean(),
  employees_count: z.number().optional(),
  created_at: z.string(),
});

export const roleListSchema = z.object({ data: z.array(roleSchema) });
export const roleResponseSchema = resourceSchema(roleSchema);

// The catalog lists everything a role can be given. Labels arrive already translated.
const catalogPermissionSchema = z.object({
  key: z.string(),
  action: z.string(),
  label: z.string(),
});

export const catalogSchema = resourceSchema(
  z.object({
    modules: z.array(
      z.object({
        module: z.string(),
        label: z.string(),
        scoped: z.boolean(),
        permissions: z.array(catalogPermissionSchema),
        fields: z.array(z.object({ field: z.string(), label: z.string() })),
      }),
    ),
    scopes: z.array(z.object({ value: z.string(), label: z.string() })),
    field_access: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
);

// What one role currently has: permissions as a per-module checklist, then scopes and field access.
export const permissionMatrixSchema = z.object({
  data: z.array(
    z.object({
      module: z.string(),
      label: z.string(),
      permissions: z.array(catalogPermissionSchema.extend({ granted: z.boolean() })),
    }),
  ),
});

export const scopeRowsSchema = z.object({
  data: z.array(
    z.object({ module: z.string(), label: z.string(), scope: z.string(), scope_label: z.string() }),
  ),
});

export const fieldRowsSchema = z.object({
  data: z.array(
    z.object({
      module: z.string(),
      field: z.string(),
      label: z.string(),
      access: z.string(),
    }),
  ),
});

export type Role = z.infer<typeof roleSchema>;
export type Catalog = z.infer<typeof catalogSchema>['data'];
export type PermissionModule = z.infer<typeof permissionMatrixSchema>['data'][number];
export type ScopeRow = z.infer<typeof scopeRowsSchema>['data'][number];
export type FieldRow = z.infer<typeof fieldRowsSchema>['data'][number];
