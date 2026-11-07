import { describe, expect, it } from 'vitest';

import { courseFormSchema } from '../schemas';
import {
  EMPTY_COURSE_FORM,
  EMPTY_ENROLLMENT_FORM,
  seatsLabel,
  toCoursePayload,
  toEnrollmentPayload,
} from './mappers';

describe('toCoursePayload', () => {
  it('sends no capacity as null (unlimited) and empty dates as null', () => {
    expect(toCoursePayload({ ...EMPTY_COURSE_FORM, name_ar: 'برمجة' })).toEqual({
      name_ar: 'برمجة',
      name_en: null,
      code: null,
      fee: null,
      capacity: null,
      starts_on: null,
      ends_on: null,
      is_active: true,
    });
  });
});

describe('courseFormSchema', () => {
  it('rejects an end date before the start date', () => {
    const result = courseFormSchema.safeParse({
      ...EMPTY_COURSE_FORM,
      name_ar: 'x',
      starts_on: '2026-12-10',
      ends_on: '2026-12-01',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['ends_on']);
  });
});

describe('seatsLabel', () => {
  it('shows the limit only when there is one', () => {
    expect(seatsLabel({ seats_taken: 12, capacity: 30 })).toBe('12 / 30');
    expect(seatsLabel({ seats_taken: 3, capacity: null })).toBe('3');
  });
});

describe('toEnrollmentPayload', () => {
  const values = {
    ...EMPTY_ENROLLMENT_FORM,
    course_id: '5',
    lead_id: '8',
    status: 'dropped' as const,
  };

  it('links the course and student on create, without a status', () => {
    expect(toEnrollmentPayload(values, true)).toEqual({
      course_id: 5,
      lead_id: 8,
      enrolled_on: null,
      notes: null,
    });
  });

  it('sends the status, never the links, on edit', () => {
    expect(toEnrollmentPayload(values, false)).toEqual({
      status: 'dropped',
      enrolled_on: null,
      notes: null,
    });
  });
});
