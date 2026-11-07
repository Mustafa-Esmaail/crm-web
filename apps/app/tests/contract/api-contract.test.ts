import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { tenantSchema, userSchema } from '@crm/api-client';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { roleSchema } from '@/features/access/roles/types';
import { engagementSchema, packageSchema } from '@/features/agency/types';
import { auditLogSchema } from '@/features/audit/types';
import { testDriveSchema, vehicleSchema } from '@/features/automotive/types';
import { appointmentSchema, serviceSchema } from '@/features/clinic/types';
import { courseSchema, enrollmentSchema } from '@/features/education/types';
import { notificationSchema } from '@/features/notifications/types';
import { branchSchema } from '@/features/organization/branches/types';
import { departmentSchema } from '@/features/organization/departments/types';
import { employeeSchema } from '@/features/organization/employees/types';
import { orgChartNodeSchema } from '@/features/organization/org-chart/types';
import { teamSchema } from '@/features/organization/teams/types';
import { unitInterestSchema, unitMediaSchema } from '@/features/real-estate/units/types';
import { dealSchema, dealStageSchema } from '@/features/sales/deals/types';
import {
  leadActivitySchema,
  leadSchema,
  leadSourceSchema,
  leadStageSchema,
} from '@/features/sales/leads/types';
import { securityPolicySchema } from '@/features/settings/security/types';

// `api.json` is the OpenAPI export of crm-api (dedoc/scramble). These tests fail when the
// frontend expects something the API does not document, so type drift is caught here, not in prod.
interface OpenApiSchema {
  properties?: Record<string, unknown>;
  required?: string[];
}
// Vitest runs from apps/app; the export sits at the repo root.
const spec = JSON.parse(readFileSync(resolve(process.cwd(), '../../api.json'), 'utf8')) as {
  components: { schemas: Record<string, OpenApiSchema> };
};

type Shape = Record<string, z.ZodType>;

/** Our schemas that refer to themselves are wrapped in `z.lazy`; unwrap to reach their fields. */
function shapeOf(schema: z.ZodType): Shape {
  const candidate = schema as unknown as {
    shape?: Shape;
    _zod: { def: { getter?: () => z.ZodType } };
  };
  if (candidate.shape) return candidate.shape;
  const inner = candidate._zod.def.getter?.();
  if (!inner) throw new Error('Cannot read the fields of this schema');
  return shapeOf(inner);
}

const CONTRACTS: Array<[string, z.ZodType, string]> = [
  ['employee', employeeSchema, 'EmployeeResource'],
  ['branch', branchSchema, 'BranchResource'],
  ['department', departmentSchema, 'DepartmentResource'],
  ['team', teamSchema, 'TeamResource'],
  ['audit log', auditLogSchema, 'AuditLogResource'],
  ['org chart node', orgChartNodeSchema, 'OrgChartNodeResource'],
  ['notification', notificationSchema, 'NotificationResource'],
  ['role', roleSchema, 'RoleResource'],
  ['deal', dealSchema, 'DealResource'],
  ['deal stage', dealStageSchema, 'DealStageResource'],
  ['lead', leadSchema, 'LeadResource'],
  ['lead stage', leadStageSchema, 'LeadStageResource'],
  ['lead source', leadSourceSchema, 'LeadSourceResource'],
  ['lead activity', leadActivitySchema, 'LeadActivityResource'],
  ['current user', userSchema, 'UserResource'],
  ['tenant', tenantSchema, 'TenantResource'],
  ['security policy', securityPolicySchema, 'SecurityPolicyResource'],
  ['clinic service', serviceSchema, 'ServiceResource'],
  ['clinic appointment', appointmentSchema, 'AppointmentResource'],
  ['education course', courseSchema, 'CourseResource'],
  ['education enrollment', enrollmentSchema, 'EnrollmentResource'],
  ['automotive vehicle', vehicleSchema, 'VehicleResource'],
  ['automotive test drive', testDriveSchema, 'TestDriveResource'],
  ['agency package', packageSchema, 'PackageResource'],
  ['agency engagement', engagementSchema, 'EngagementResource'],
  ['unit interest', unitInterestSchema, 'UnitInterestResource'],
  ['unit media', unitMediaSchema, 'UnitMediaResource'],
];

describe.each(CONTRACTS)('API contract: %s', (_label, schema, resourceName) => {
  const resource = spec.components.schemas[resourceName];
  const documented = Object.keys(resource?.properties ?? {});
  const documentedRequired = new Set(resource?.required ?? []);
  const shape = shapeOf(schema);

  it('exists in the API spec', () => {
    expect(resource, `${resourceName} is missing from api.json`).toBeDefined();
  });

  it('only expects fields the API documents', () => {
    const unknownToApi = Object.keys(shape).filter((field) => !documented.includes(field));

    expect(unknownToApi).toEqual([]);
  });

  it('only requires fields the API always sends', () => {
    const requiredHere = Object.entries(shape)
      .filter(([, field]) => !field.isOptional())
      .map(([name]) => name);
    const notGuaranteed = requiredHere.filter((field) => !documentedRequired.has(field));

    expect(notGuaranteed).toEqual([]);
  });
});
