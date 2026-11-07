import type { QueryParams } from '@/lib/api/query-string';

export const educationKeys = {
  all: ['education'] as const,
  courses: (params: QueryParams) => [...educationKeys.all, 'courses', params] as const,
  enrollments: (params: QueryParams) => [...educationKeys.all, 'enrollments', params] as const,
};

export const COURSE_FILTER_IDS = ['is_active'] as const;
export const ENROLLMENT_FILTER_IDS = ['status', 'course_id'] as const;
export const EDUCATION_PAGE_SIZE = 15;
