'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { buildListParams, type ListQuery } from '@/lib/api/list-params';
import type { AsyncOptionsResult } from '@/shared/components/form/async-select-field';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getTestDrives, getVehicles } from '../api/automotive-requests';
import { automotiveKeys } from '../constants';
import { vehicleLabel } from '../utils/mappers';

export function useVehiclesQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const params = buildListParams(query);

  return useQuery({
    queryKey: automotiveKeys.vehicles(params),
    queryFn: ({ signal }) => getVehicles(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Searchable vehicles for pickers and filters. Sold cars stay listed; the API explains a refusal. */
export function useVehicleOptions(search: string): AsyncOptionsResult {
  const http = useHttpClient();
  const params = buildListParams({ search, perPage: 20 });

  const query = useQuery({
    queryKey: automotiveKeys.vehicles({ ...params, purpose: 'options' }),
    queryFn: ({ signal }) => getVehicles(http, params, signal),
    placeholderData: keepPreviousData,
  });

  return {
    options: (query.data?.data ?? []).map((vehicle) => ({
      value: String(vehicle.id),
      label: vehicle.vin ? `${vehicleLabel(vehicle)} · ${vehicle.vin}` : vehicleLabel(vehicle),
    })),
    isLoading: query.isLoading,
  };
}

export function useTestDrivesQuery(query: ListQuery, enabled: boolean) {
  const http = useHttpClient();
  const params = buildListParams(query);

  return useQuery({
    queryKey: automotiveKeys.testDrives(params),
    queryFn: ({ signal }) => getTestDrives(http, params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}
