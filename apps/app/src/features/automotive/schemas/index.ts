import { z } from 'zod';

import { TEST_DRIVE_STATUSES, VEHICLE_STATUSES } from '../types';

/** The API accepts model years from 1980 to next year. */
export const MAX_MODEL_YEAR = new Date().getFullYear() + 1;

// Mirrors VehicleRequest; messages are i18n keys translated by FormField.
export const vehicleFormSchema = z.object({
  make: z.string().trim().min(1, 'validation.required').max(80, 'validation.maxLength'),
  model: z.string().trim().min(1, 'validation.required').max(80, 'validation.maxLength'),
  year: z
    .number('validation.required')
    .int('validation.number')
    .min(1980, 'validation.min')
    .max(MAX_MODEL_YEAR, 'validation.max'),
  vin: z.string().max(30, 'validation.maxLength'),
  color: z.string().max(40, 'validation.maxLength'),
  price: z.number('validation.number').min(0, 'validation.min').optional(),
  status: z.enum(VEHICLE_STATUSES),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

// Mirrors TestDriveRequest. The vehicle and the customer are fixed once booked.
export const testDriveFormSchema = z.object({
  vehicle_id: z.string(),
  lead_id: z.string(),
  starts_at: z.string().min(1, 'validation.required'),
  status: z.enum(TEST_DRIVE_STATUSES),
  notes: z.string().max(5000, 'validation.maxLength'),
});

export const testDriveCreateSchema = testDriveFormSchema.extend({
  vehicle_id: z.string().min(1, 'validation.required'),
  lead_id: z.string().min(1, 'validation.required'),
});

export type TestDriveFormValues = z.infer<typeof testDriveFormSchema>;
