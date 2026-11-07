'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { buildListParams } from '@/lib/api/list-params';
import type { AsyncOptionsResult } from '@/shared/components/form/async-select-field';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getProjects } from '../api/project-requests';
import { projectKeys } from '../constants';

export interface ProjectListQuery {
  search: string;
  page: number;
  perPage: number;
  status?: string | null;
}

export function useProjectsQuery(query: ProjectListQuery) {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({
    search: query.search,
    page: query.page,
    perPage: query.perPage,
    filters: { status: query.status },
  });

  return useQuery({
    queryKey: projectKeys.list({ ...params, locale }),
    queryFn: ({ signal }) => getProjects(http, params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Searchable projects for pickers and filters. */
export function useProjectOptions(search: string): AsyncOptionsResult {
  const http = useHttpClient();
  const locale = useLocale();
  const params = buildListParams({ search, perPage: 20 });

  const query = useQuery({
    queryKey: projectKeys.list({ ...params, locale, purpose: 'options' }),
    queryFn: ({ signal }) => getProjects(http, params, signal),
    placeholderData: keepPreviousData,
  });

  return {
    options: (query.data?.data ?? []).map((project) => ({
      value: String(project.id),
      label: project.name,
    })),
    isLoading: query.isLoading,
  };
}
