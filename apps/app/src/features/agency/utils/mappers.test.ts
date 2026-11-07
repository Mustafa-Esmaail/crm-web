import { describe, expect, it } from 'vitest';

import { engagementCreateSchema } from '../schemas';
import {
  allowedEngagementStatuses,
  EMPTY_ENGAGEMENT_FORM,
  EMPTY_PACKAGE_FORM,
  toEngagementPayload,
  toPackagePayload,
} from './mappers';

describe('toPackagePayload', () => {
  it('nulls empty optional inputs', () => {
    expect(toPackagePayload({ ...EMPTY_PACKAGE_FORM, name_ar: 'سوشيال' })).toEqual({
      name_ar: 'سوشيال',
      name_en: null,
      code: null,
      monthly_fee: null,
      deliverables: null,
      is_active: true,
    });
  });
});

describe('toEngagementPayload', () => {
  const values = {
    ...EMPTY_ENGAGEMENT_FORM,
    package_id: '2',
    lead_id: '6',
    status: 'active' as const,
    monthly_fee: 5000,
  };

  it('signs the package and client without a status', () => {
    expect(toEngagementPayload(values, true)).toEqual({
      package_id: 2,
      lead_id: 6,
      monthly_fee: 5000,
      starts_on: null,
      ends_on: null,
      notes: null,
    });
  });

  it('sends the status, never the links, on edit', () => {
    const payload = toEngagementPayload(values, false);
    expect(payload).toMatchObject({ status: 'active' });
    expect(payload).not.toHaveProperty('package_id');
    expect(payload).not.toHaveProperty('lead_id');
  });
});

describe('engagementCreateSchema', () => {
  it('puts each missing link on its own field', () => {
    const result = engagementCreateSchema.safeParse(EMPTY_ENGAGEMENT_FORM);
    const paths = result.error?.issues.map((issue) => issue.path[0]);
    expect(paths).toEqual(expect.arrayContaining(['package_id', 'lead_id']));
  });
});

describe('allowedEngagementStatuses', () => {
  it('keeps an ended engagement ended', () => {
    expect(allowedEngagementStatuses('ended')).toEqual(['ended']);
    expect(allowedEngagementStatuses('paused')).toContain('active');
  });
});
