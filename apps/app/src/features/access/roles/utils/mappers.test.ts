import { describe, expect, it } from 'vitest';

import { roleFormSchema } from '../schemas';
import type { Role } from '../types';
import { EMPTY_ROLE_FORM, toRoleFormValues, toRolePayload } from './mappers';

const role: Role = {
  id: 7,
  key: 'support',
  name: 'Support',
  name_ar: 'الدعم',
  name_en: null,
  description: null,
  is_system: false,
  created_at: '2026-10-30T00:00:00+00:00',
};

describe('role mappers', () => {
  it('turns nulls into empty strings for the form', () => {
    expect(toRoleFormValues(role)).toEqual({
      name_ar: 'الدعم',
      name_en: '',
      key: 'support',
      description: '',
    });
  });

  it('sends empty optional fields as null so the API clears them', () => {
    expect(toRolePayload({ ...EMPTY_ROLE_FORM, name_ar: ' الدعم ' })).toEqual({
      name_ar: 'الدعم',
      name_en: null,
      key: null,
      description: null,
    });
  });
});

describe('roleFormSchema', () => {
  const valid = { ...EMPTY_ROLE_FORM, name_ar: 'الدعم' };

  it('needs an Arabic name', () => {
    expect(roleFormSchema.safeParse(EMPTY_ROLE_FORM).success).toBe(false);
    expect(roleFormSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty key or a snake_case one, and rejects the rest', () => {
    expect(roleFormSchema.safeParse({ ...valid, key: 'sales_lead_2' }).success).toBe(true);
    expect(roleFormSchema.safeParse({ ...valid, key: 'Sales Lead' }).success).toBe(false);
    expect(roleFormSchema.safeParse({ ...valid, key: '2fast' }).success).toBe(false);
  });
});
