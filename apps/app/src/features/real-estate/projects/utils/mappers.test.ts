import { describe, expect, it } from 'vitest';

import { EMPTY_PROJECT_FORM, toProjectPayload } from './mappers';

describe('toProjectPayload', () => {
  it('turns empty optional inputs into nulls', () => {
    const payload = toProjectPayload({ ...EMPTY_PROJECT_FORM, name_ar: ' برج ' });
    expect(payload).toMatchObject({
      name_ar: 'برج',
      name_en: null,
      code: null,
      delivery_date: null,
      status: 'planning',
    });
  });
});
