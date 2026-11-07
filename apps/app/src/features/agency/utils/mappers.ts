import { toNumber } from '@/lib/utils/number';
import { emptyToNull } from '@/lib/utils/strings';

import type { EngagementFormValues, PackageFormValues } from '../schemas';
import {
  type AgencyPackage,
  type Engagement,
  ENGAGEMENT_STATUSES,
  type EngagementStatus,
} from '../types';

const day = (value: string | null | undefined) => value?.slice(0, 10) ?? '';

export const EMPTY_PACKAGE_FORM: PackageFormValues = {
  name_ar: '',
  name_en: '',
  code: '',
  monthly_fee: undefined,
  deliverables: '',
  is_active: true,
};

export function toPackageFormValues(pkg: AgencyPackage): PackageFormValues {
  return {
    name_ar: pkg.name_ar,
    name_en: pkg.name_en ?? '',
    code: pkg.code ?? '',
    monthly_fee: toNumber(pkg.monthly_fee) ?? undefined,
    deliverables: pkg.deliverables ?? '',
    is_active: pkg.is_active,
  };
}

export function toPackagePayload(values: PackageFormValues) {
  return {
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    code: emptyToNull(values.code),
    monthly_fee: values.monthly_fee ?? null,
    deliverables: emptyToNull(values.deliverables),
    is_active: values.is_active,
  };
}

export const EMPTY_ENGAGEMENT_FORM: EngagementFormValues = {
  package_id: '',
  lead_id: '',
  status: 'proposed',
  monthly_fee: undefined,
  starts_on: '',
  ends_on: '',
  notes: '',
};

export function toEngagementFormValues(engagement: Engagement): EngagementFormValues {
  return {
    package_id: String(engagement.package?.id ?? ''),
    lead_id: String(engagement.lead_id),
    status: engagement.status,
    monthly_fee: toNumber(engagement.monthly_fee) ?? undefined,
    starts_on: day(engagement.starts_on),
    ends_on: day(engagement.ends_on),
    notes: engagement.notes ?? '',
  };
}

/**
 * Signing sends the package and client (an empty fee takes the package's). Editing never sends them,
 * and sends the status, which the API refuses on create.
 */
export function toEngagementPayload(values: EngagementFormValues, isCreate: boolean) {
  const shared = {
    monthly_fee: values.monthly_fee ?? null,
    starts_on: emptyToNull(values.starts_on),
    ends_on: emptyToNull(values.ends_on),
    notes: emptyToNull(values.notes),
  };
  return isCreate
    ? { package_id: Number(values.package_id), lead_id: Number(values.lead_id), ...shared }
    : { status: values.status, ...shared };
}

/** An ended engagement stays ended (EngagementStatus::canBecome in the API). */
export function allowedEngagementStatuses(current: EngagementStatus): readonly EngagementStatus[] {
  return current === 'ended' ? ['ended'] : ENGAGEMENT_STATUSES;
}
