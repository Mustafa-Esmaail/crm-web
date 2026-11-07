'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { buildListParams } from '@/lib/api/list-params';
import type { SelectOption } from '@/shared/components/form/field-types';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { deleteBuilding, getBuildings, saveBuilding } from '../api/building-requests';
import { buildingKeys } from '../constants';
import type { BuildingFormValues } from '../schemas';
import { toBuildingPayload } from '../utils/mappers';

export function useBuildingsQuery(query: {
  search: string;
  page: number;
  perPage: number;
  projectId?: string | null;
}) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({
    search: query.search,
    page: query.page,
    perPage: query.perPage,
    filters: { project_id: query.projectId },
  });

  return useQuery({
    queryKey: buildingKeys.list({ ...params, locale }),
    queryFn: ({ signal }) => getBuildings(http, params, signal),
    placeholderData: keepPreviousData,
  });
}

/** A project's buildings for a picker; nothing is fetched until a project is chosen. */
export function useBuildingOptions(projectId: string): {
  options: SelectOption[];
  isLoading: boolean;
} {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({ perPage: 100, filters: { project_id: projectId } });

  const query = useQuery({
    queryKey: buildingKeys.list({ ...params, locale, purpose: 'options' }),
    queryFn: ({ signal }) => getBuildings(http, params, signal),
    enabled: projectId !== '',
  });

  return {
    options: (query.data?.data ?? []).map((building) => ({
      value: String(building.id),
      label: building.name,
    })),
    isLoading: query.isLoading && projectId !== '',
  };
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: buildingKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['re-units'] });
  };
}

export function useSaveBuilding() {
  const http = useHttpClient();
  const refresh = useRefresh();
  const t = useTranslations('buildings');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: BuildingFormValues }) =>
      saveBuilding(http, id, toBuildingPayload(values)),
    onSuccess: (_result, { id }) => {
      refresh();
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteBuilding() {
  const http = useHttpClient();
  const refresh = useRefresh();
  const t = useTranslations('buildings');

  return useMutation({
    mutationFn: (id: number) => deleteBuilding(http, id),
    onSuccess: () => {
      refresh();
      toast.success(t('toast.deleted'));
    },
  });
}
