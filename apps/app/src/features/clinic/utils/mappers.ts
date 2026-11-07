import { fromDateTimeInput, toDateTimeInput } from '@/lib/utils/dates';
import { toNumber } from '@/lib/utils/number';
import { emptyToNull } from '@/lib/utils/strings';

import type { AppointmentFormValues, ServiceFormValues } from '../schemas';
import type { Appointment, Service } from '../types';

export const EMPTY_SERVICE_FORM: ServiceFormValues = {
  name_ar: '',
  name_en: '',
  code: '',
  duration_minutes: 30,
  price: undefined,
  is_active: true,
};

export function toServiceFormValues(service: Service): ServiceFormValues {
  return {
    name_ar: service.name_ar,
    name_en: service.name_en ?? '',
    code: service.code ?? '',
    duration_minutes: service.duration_minutes,
    price: toNumber(service.price) ?? undefined,
    is_active: service.is_active,
  };
}

export function toServicePayload(values: ServiceFormValues) {
  return {
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    code: emptyToNull(values.code),
    duration_minutes: values.duration_minutes,
    price: values.price ?? null,
    is_active: values.is_active,
  };
}

export const EMPTY_APPOINTMENT_FORM: AppointmentFormValues = {
  service_id: '',
  lead_id: '',
  doctor_id: '',
  starts_at: '',
  status: 'scheduled',
  notes: '',
};

export function toAppointmentFormValues(appointment: Appointment): AppointmentFormValues {
  return {
    service_id: String(appointment.service?.id ?? ''),
    lead_id: String(appointment.lead_id),
    doctor_id: String(appointment.doctor_id),
    starts_at: toDateTimeInput(appointment.starts_at),
    status: appointment.status,
    notes: appointment.notes ?? '',
  };
}

/**
 * Creating books the service, lead and doctor. Editing never sends them (the API prohibits it),
 * and sends the time only when it changed: the API requires a future time whenever it is present,
 * so resending a past appointment's time would block a plain status change.
 */
export function toAppointmentPayload(values: AppointmentFormValues, original?: Appointment) {
  const notes = emptyToNull(values.notes);

  if (!original) {
    return {
      service_id: Number(values.service_id),
      lead_id: Number(values.lead_id),
      doctor_id: Number(values.doctor_id),
      starts_at: fromDateTimeInput(values.starts_at),
      notes,
    };
  }

  const timeChanged = values.starts_at !== toDateTimeInput(original.starts_at);
  return {
    ...(timeChanged ? { starts_at: fromDateTimeInput(values.starts_at) } : {}),
    status: values.status,
    notes,
  };
}
