import { emptyToNull, idOrNull } from '@/lib/utils/strings';
import type { FilterDefinition } from '@/shared/components/data-table/types';

import { ACTIVE_FILTER_VALUE, BRANCH_STATUS, INACTIVE_FILTER_VALUE } from '../constants';
import type { BranchFormValues } from '../schemas';
import type { Branch } from '../types';

export const EMPTY_BRANCH_FORM: BranchFormValues = {
  name_ar: '',
  name_en: '',
  code: '',
  city: '',
  address: '',
  phone: '',
  manager_id: '',
  is_active: true,
};

/** API resource -> form values (nulls become '' because inputs are always strings). */
export function toBranchFormValues(branch: Branch): BranchFormValues {
  return {
    name_ar: branch.name_ar,
    name_en: branch.name_en ?? '',
    code: branch.code ?? '',
    city: branch.city ?? '',
    address: branch.address ?? '',
    phone: branch.phone ?? '',
    manager_id: branch.manager ? String(branch.manager.id) : '',
    is_active: branch.is_active,
  };
}

/** Form values -> request body, the inverse of the mapper above. */
export function toBranchPayload(values: BranchFormValues) {
  return {
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    code: emptyToNull(values.code),
    city: emptyToNull(values.city),
    address: emptyToNull(values.address),
    phone: emptyToNull(values.phone),
    manager_id: idOrNull(values.manager_id),
    is_active: values.is_active,
  };
}

export function getBranchStatus(branch: Branch): string {
  return branch.is_active ? BRANCH_STATUS.active : BRANCH_STATUS.inactive;
}

export function createBranchFilters(t: (key: string) => string): FilterDefinition[] {
  return [
    {
      id: 'is_active',
      label: t('filters.status'),
      options: [
        { value: ACTIVE_FILTER_VALUE, label: t('status.active') },
        { value: INACTIVE_FILTER_VALUE, label: t('status.inactive') },
      ],
    },
  ];
}
