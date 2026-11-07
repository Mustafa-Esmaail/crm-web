import { describe, expect, it } from 'vitest';

import { toDateTimeInput } from '@/lib/utils/dates';

import type { Appointment } from '../types';
import {
  EMPTY_APPOINTMENT_FORM,
  EMPTY_SERVICE_FORM,
  toAppointmentFormValues,
  toAppointmentPayload,
  toServicePayload,
} from './mappers';

const APPOINTMENT: Appointment = {
  id: 9,
  service: { id: 2, name: 'Cleaning', duration_minutes: 30 },
  lead_id: 4,
  doctor_id: 7,
  starts_at: '2026-01-05T09:00:00+00:00',
  ends_at: '2026-01-05T09:30:00+00:00',
  status: 'scheduled',
  notes: null,
  created_at: null,
};

describe('toServicePayload', () => {
  it('turns empty optional inputs into nulls', () => {
    expect(toServicePayload({ ...EMPTY_SERVICE_FORM, name_ar: ' تنظيف ' })).toEqual({
      name_ar: 'تنظيف',
      name_en: null,
      code: null,
      duration_minutes: 30,
      price: null,
      is_active: true,
    });
  });
});

describe('toAppointmentPayload', () => {
  it('books the service, lead and doctor with an absolute start time', () => {
    const payload = toAppointmentPayload({
      ...EMPTY_APPOINTMENT_FORM,
      service_id: '2',
      lead_id: '4',
      doctor_id: '7',
      starts_at: toDateTimeInput('2026-12-01T08:00:00Z'),
    });
    expect(payload).toEqual({
      service_id: 2,
      lead_id: 4,
      doctor_id: 7,
      starts_at: '2026-12-01T08:00:00.000Z',
      notes: null,
    });
  });

  // A past appointment's unchanged time would fail the API's "after:now" rule.
  it('leaves the time out of an edit that only changes the status', () => {
    const values = { ...toAppointmentFormValues(APPOINTMENT), status: 'completed' as const };
    expect(toAppointmentPayload(values, APPOINTMENT)).toEqual({ status: 'completed', notes: null });
  });

  it('sends a moved time, and never the fixed links, on edit', () => {
    const values = {
      ...toAppointmentFormValues(APPOINTMENT),
      starts_at: toDateTimeInput('2026-12-02T10:00:00Z'),
    };
    const payload = toAppointmentPayload(values, APPOINTMENT);
    expect(payload).toMatchObject({ starts_at: '2026-12-02T10:00:00.000Z' });
    expect(payload).not.toHaveProperty('service_id');
    expect(payload).not.toHaveProperty('lead_id');
    expect(payload).not.toHaveProperty('doctor_id');
  });
});
