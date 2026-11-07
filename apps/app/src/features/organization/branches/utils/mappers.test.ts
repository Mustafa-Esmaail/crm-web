import { describe, expect, it } from 'vitest';

import type { Branch } from '../types';
import { EMPTY_BRANCH_FORM, getBranchStatus, toBranchFormValues, toBranchPayload } from './mappers';

const branch: Branch = {
  id: 7,
  name: 'Cairo HQ',
  name_ar: 'المقر الرئيسي',
  name_en: 'Cairo HQ',
  code: 'CAI',
  city: 'Cairo',
  address: null,
  phone: '+20100000000',
  is_active: true,
  manager: { id: 3, name: 'Layla' },
};

describe('toBranchPayload', () => {
  it('turns cleared inputs into null so the API empties the column', () => {
    const payload = toBranchPayload({ ...EMPTY_BRANCH_FORM, name_ar: 'فرع', city: '   ' });

    expect(payload).toMatchObject({
      name_ar: 'فرع',
      name_en: null,
      code: null,
      city: null,
      address: null,
      phone: null,
      manager_id: null,
    });
  });

  it('sends the manager as an integer, not the picker string', () => {
    const payload = toBranchPayload({ ...EMPTY_BRANCH_FORM, name_ar: 'فرع', manager_id: '12' });

    expect(payload.manager_id).toBe(12);
  });

  it('trims the required name', () => {
    expect(toBranchPayload({ ...EMPTY_BRANCH_FORM, name_ar: '  فرع  ' }).name_ar).toBe('فرع');
  });
});

describe('toBranchFormValues', () => {
  it('shows nulls as empty strings because inputs are always controlled strings', () => {
    const values = toBranchFormValues(branch);

    expect(values.address).toBe('');
    expect(values.manager_id).toBe('3');
    expect(values.code).toBe('CAI');
  });

  it('round-trips a branch back into an equivalent payload', () => {
    const payload = toBranchPayload(toBranchFormValues(branch));

    expect(payload).toEqual({
      name_ar: 'المقر الرئيسي',
      name_en: 'Cairo HQ',
      code: 'CAI',
      city: 'Cairo',
      address: null,
      phone: '+20100000000',
      manager_id: 3,
      is_active: true,
    });
  });

  it('leaves the manager empty when the branch has none', () => {
    expect(toBranchFormValues({ ...branch, manager: null }).manager_id).toBe('');
  });
});

describe('getBranchStatus', () => {
  it('maps the boolean flag onto the status vocabulary the badge understands', () => {
    expect(getBranchStatus(branch)).toBe('active');
    expect(getBranchStatus({ ...branch, is_active: false })).toBe('inactive');
  });
});
