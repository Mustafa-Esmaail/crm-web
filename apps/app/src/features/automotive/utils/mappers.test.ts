import { describe, expect, it } from 'vitest';

import type { TestDrive } from '../types';
import {
  EMPTY_VEHICLE_FORM,
  toTestDriveFormValues,
  toTestDrivePayload,
  toVehiclePayload,
  vehicleLabel,
} from './mappers';

describe('toVehiclePayload', () => {
  it('trims names, capitalises the VIN and nulls empty optionals', () => {
    expect(
      toVehiclePayload({
        ...EMPTY_VEHICLE_FORM,
        make: ' Toyota ',
        model: 'Corolla',
        year: 2024,
        vin: ' jt2ae92e ',
      }),
    ).toEqual({
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      vin: 'JT2AE92E',
      color: null,
      price: null,
      status: 'available',
    });
  });
});

describe('vehicleLabel', () => {
  it('reads make, model and year', () => {
    expect(vehicleLabel({ make: 'Kia', model: 'Rio', year: 2023 })).toBe('Kia Rio 2023');
  });
});

describe('toTestDrivePayload', () => {
  const past: TestDrive = {
    id: 1,
    vehicle: { id: 3, make: 'Kia', model: 'Rio', year: 2023 },
    lead_id: 4,
    starts_at: '2025-01-05T09:00:00+00:00',
    ends_at: null,
    status: 'scheduled',
    notes: null,
    created_at: null,
  };

  it('marks a past drive as done without resending its time', () => {
    const values = { ...toTestDriveFormValues(past), status: 'completed' as const };
    expect(toTestDrivePayload(values, past)).toEqual({ status: 'completed', notes: null });
  });
});
