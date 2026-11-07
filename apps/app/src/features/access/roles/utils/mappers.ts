import { emptyToNull } from '@/lib/utils/strings';

import type { RoleFormValues } from '../schemas';
import type { Role } from '../types';

export const EMPTY_ROLE_FORM: RoleFormValues = {
  name_ar: '',
  name_en: '',
  key: '',
  description: '',
};

export function toRoleFormValues(role: Role): RoleFormValues {
  return {
    name_ar: role.name_ar,
    name_en: role.name_en ?? '',
    key: role.key,
    description: role.description ?? '',
  };
}

export function toRolePayload(values: RoleFormValues) {
  return {
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    key: emptyToNull(values.key),
    description: emptyToNull(values.description),
  };
}
