import type { QueryParams } from '@/lib/api/query-string';

export const agencyKeys = {
  all: ['agency'] as const,
  packages: (params: QueryParams) => [...agencyKeys.all, 'packages', params] as const,
  engagements: (params: QueryParams) => [...agencyKeys.all, 'engagements', params] as const,
};

export const PACKAGE_FILTER_IDS = ['is_active'] as const;
export const ENGAGEMENT_FILTER_IDS = ['status', 'package_id'] as const;
export const AGENCY_PAGE_SIZE = 15;
