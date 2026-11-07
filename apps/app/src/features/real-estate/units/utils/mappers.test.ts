import { describe, expect, it } from 'vitest';

import { EMPTY_UNIT_FORM, toReservePayload, toUnitPayload } from './mappers';

describe('unit mappers', () => {
  it('turns empty optional numbers into nulls', () => {
    const payload = toUnitPayload({
      ...EMPTY_UNIT_FORM,
      project_id: '3',
      unit_number: ' A-1 ',
      area_sqm: 120,
    });
    expect(payload).toMatchObject({
      project_id: 3,
      unit_number: 'A-1',
      area_sqm: 120,
      floor: null,
      price: null,
      notes: null,
    });
  });

  it('sends reservation extras as null when left empty', () => {
    expect(toReservePayload({ lead_id: '9', hold_hours: undefined, deposit_amount: 500 })).toEqual({
      lead_id: 9,
      hold_hours: null,
      deposit_amount: 500,
    });
  });
});
