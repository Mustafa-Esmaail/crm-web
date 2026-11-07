'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import type { AsyncOptionsResult } from '@/shared/components/form/async-select-field';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getAppointments, getServices } from '../api/clinic-requests';
import { clinicKeys } from '../constants';

export function useServicesQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams(query);

  return useQuery({
    queryKey: clinicKeys.services({ ...params, locale }),
    queryFn: ({ signal }) => getServices(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Searchable services for pickers and filters; `activeOnly` for booking (the API refuses inactive). */
export function useServiceOptions(search: string, activeOnly = false): AsyncOptionsResult {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({
    search,
    perPage: 20,
    filters: activeOnly ? { is_active: 1 } : {},
  });

  const query = useQuery({
    queryKey: clinicKeys.services({ ...params, locale, purpose: 'options' }),
    queryFn: ({ signal }) => getServices(http, params, signal),
    placeholderData: keepPreviousData,
  });

  return {
    options: (query.data?.data ?? []).map((service) => ({
      value: String(service.id),
      label: service.code ? `${service.name} · ${service.code}` : service.name,
    })),
    isLoading: query.isLoading,
  };
}

export const useActiveServiceOptions = (search: string) => useServiceOptions(search, true);

export function useAppointmentsQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams(query);

  return useQuery({
    queryKey: clinicKeys.appointments({ ...params, locale }),
    queryFn: ({ signal }) => getAppointments(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}
