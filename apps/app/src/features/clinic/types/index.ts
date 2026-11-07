import { paginatedSchema } from '@crm/api-client';
import { z } from 'zod';

const money = z.union([z.string(), z.number()]).nullable();

// ServiceResource
export const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullable(),
  code: z.string().nullable(),
  duration_minutes: z.number(),
  price: money,
  is_active: z.boolean(),
  created_at: z.string().nullable(),
});

export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

// AppointmentResource: the lead and the doctor come as ids only (their own screens authorize them).
export const appointmentSchema = z.object({
  id: z.number(),
  service: z.object({ id: z.number(), name: z.string(), duration_minutes: z.number() }).optional(),
  lead_id: z.number(),
  doctor_id: z.number(),
  starts_at: z.string(),
  ends_at: z.string().nullable(),
  status: z.enum(APPOINTMENT_STATUSES),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const serviceListSchema = paginatedSchema(serviceSchema);
export const appointmentListSchema = paginatedSchema(appointmentSchema);

export type Service = z.infer<typeof serviceSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type AppointmentStatus = Appointment['status'];
