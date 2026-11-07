import { fromDateTimeInput, toDateTimeInput } from '@/lib/utils/dates';
import { toNumber } from '@/lib/utils/number';
import { emptyToNull } from '@/lib/utils/strings';

import type { TestDriveFormValues, VehicleFormValues } from '../schemas';
import type { TestDrive, Vehicle } from '../types';

/** "Toyota Corolla 2024" */
export function vehicleLabel(vehicle: Pick<Vehicle, 'make' | 'model' | 'year'>): string {
  return `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
}

export const EMPTY_VEHICLE_FORM: VehicleFormValues = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  color: '',
  price: undefined,
  status: 'available',
};

export function toVehicleFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    vin: vehicle.vin ?? '',
    color: vehicle.color ?? '',
    price: toNumber(vehicle.price) ?? undefined,
    status: vehicle.status,
  };
}

export function toVehiclePayload(values: VehicleFormValues) {
  return {
    make: values.make.trim(),
    model: values.model.trim(),
    year: values.year,
    // VINs are written in capitals; normalising keeps the API's uniqueness check meaningful.
    vin: emptyToNull(values.vin)?.toUpperCase() ?? null,
    color: emptyToNull(values.color),
    price: values.price ?? null,
    status: values.status,
  };
}

export const EMPTY_TEST_DRIVE_FORM: TestDriveFormValues = {
  vehicle_id: '',
  lead_id: '',
  starts_at: '',
  status: 'scheduled',
  notes: '',
};

export function toTestDriveFormValues(testDrive: TestDrive): TestDriveFormValues {
  return {
    vehicle_id: String(testDrive.vehicle?.id ?? ''),
    lead_id: String(testDrive.lead_id),
    starts_at: toDateTimeInput(testDrive.starts_at),
    status: testDrive.status,
    notes: testDrive.notes ?? '',
  };
}

/**
 * Booking sends the vehicle and customer. Editing never does (the API prohibits it) and sends the
 * time only when it changed, because the API requires a future time whenever one is present.
 */
export function toTestDrivePayload(values: TestDriveFormValues, original?: TestDrive) {
  const notes = emptyToNull(values.notes);

  if (!original) {
    return {
      vehicle_id: Number(values.vehicle_id),
      lead_id: Number(values.lead_id),
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
