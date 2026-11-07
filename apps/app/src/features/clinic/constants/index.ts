import type { QueryParams } from '@/lib/api/query-string';

export const clinicKeys = {
  all: ['clinic'] as const,
  services: (params: QueryParams) => [...clinicKeys.all, 'services', params] as const,
  appointments: (params: QueryParams) => [...clinicKeys.all, 'appointments', params] as const,
};

export const SERVICE_FILTER_IDS = ['is_active'] as const;
export const APPOINTMENT_FILTER_IDS = ['status', 'service_id', 'doctor_id'] as const;
export const CLINIC_PAGE_SIZE = 15;
