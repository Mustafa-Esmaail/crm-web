import { paginatedSchema } from '@crm/api-client';
import { z } from 'zod';

export const VEHICLE_STATUSES = ['available', 'reserved', 'sold'] as const;

// VehicleResource
export const vehicleSchema = z.object({
  id: z.number(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  vin: z.string().nullable(),
  color: z.string().nullable(),
  price: z.union([z.string(), z.number()]).nullable(),
  status: z.enum(VEHICLE_STATUSES),
  created_at: z.string().nullable(),
});

export const TEST_DRIVE_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

// TestDriveResource: the customer is a lead, sent by id only.
export const testDriveSchema = z.object({
  id: z.number(),
  vehicle: z
    .object({ id: z.number(), make: z.string(), model: z.string(), year: z.number() })
    .optional(),
  lead_id: z.number(),
  starts_at: z.string(),
  ends_at: z.string().nullable(),
  status: z.enum(TEST_DRIVE_STATUSES),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const vehicleListSchema = paginatedSchema(vehicleSchema);
export const testDriveListSchema = paginatedSchema(testDriveSchema);

export type Vehicle = z.infer<typeof vehicleSchema>;
export type TestDrive = z.infer<typeof testDriveSchema>;
