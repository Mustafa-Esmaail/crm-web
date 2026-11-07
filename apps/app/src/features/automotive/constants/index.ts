import type { QueryParams } from '@/lib/api/query-string';

export const automotiveKeys = {
  all: ['automotive'] as const,
  vehicles: (params: QueryParams) => [...automotiveKeys.all, 'vehicles', params] as const,
  testDrives: (params: QueryParams) => [...automotiveKeys.all, 'test-drives', params] as const,
};

export const VEHICLE_FILTER_IDS = ['status'] as const;
export const TEST_DRIVE_FILTER_IDS = ['status', 'vehicle_id'] as const;
export const AUTOMOTIVE_PAGE_SIZE = 15;
