'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import type { AsyncOptionsResult } from '@/shared/components/form/async-select-field';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getCourses, getEnrollments } from '../api/education-requests';
import { educationKeys } from '../constants';

export function useCoursesQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams(query);

  return useQuery({
    queryKey: educationKeys.courses({ ...params, locale }),
    queryFn: ({ signal }) => getCourses(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Searchable courses for pickers and filters; `activeOnly` for enrolling (the API refuses inactive). */
export function useCourseOptions(search: string, activeOnly = false): AsyncOptionsResult {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({
    search,
    perPage: 20,
    filters: activeOnly ? { is_active: 1 } : {},
  });

  const query = useQuery({
    queryKey: educationKeys.courses({ ...params, locale, purpose: 'options' }),
    queryFn: ({ signal }) => getCourses(http, params, signal),
    placeholderData: keepPreviousData,
  });

  return {
    options: (query.data?.data ?? []).map((course) => ({
      value: String(course.id),
      label: course.code ? `${course.name} · ${course.code}` : course.name,
    })),
    isLoading: query.isLoading,
  };
}

export const useActiveCourseOptions = (search: string) => useCourseOptions(search, true);

export function useEnrollmentsQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams(query);

  return useQuery({
    queryKey: educationKeys.enrollments({ ...params, locale }),
    queryFn: ({ signal }) => getEnrollments(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}
