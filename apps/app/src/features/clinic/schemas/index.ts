import { z } from 'zod';

import { APPOINTMENT_STATUSES } from '../types';

// Mirrors ServiceRequest; messages are i18n keys translated by FormField.
export const serviceFormSchema = z.object({
  name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
  name_en: z.string().max(150, 'validation.maxLength'),
  code: z.string().max(30, 'validation.maxLength'),
  duration_minutes: z
    .number('validation.required')
    .int('validation.number')
    .min(5, 'validation.min')
    .max(480, 'validation.max'),
  price: z.number('validation.number').min(0, 'validation.min').optional(),
  is_active: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

// Mirrors AppointmentRequest. Service, lead and doctor are fixed once booked.
export const appointmentFormSchema = z.object({
  service_id: z.string(),
  lead_id: z.string(),
  doctor_id: z.string(),
  starts_at: z.string().min(1, 'validation.required'),
  status: z.enum(APPOINTMENT_STATUSES),
  notes: z.string().max(5000, 'validation.maxLength'),
});

/** Creating needs the three links the API makes required; editing never sends them. */
export const appointmentCreateSchema = appointmentFormSchema.extend({
  service_id: z.string().min(1, 'validation.required'),
  lead_id: z.string().min(1, 'validation.required'),
  doctor_id: z.string().min(1, 'validation.required'),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
