'use client';

import { useQuery } from '@tanstack/react-query';

import { buildListParams } from '@/lib/api/list-params';
import type { SelectOption } from '@/shared/components/form/field-types';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { getBranches } from '../api/branch-requests';
import { branchKeys } from '../constants';

// The API caps a page at 100; a company with more branches than that needs a searchable picker.
const OPTIONS_PAGE_SIZE = 100;

/** Every branch as picker options, for selects and filter chips in other features. */
export function useBranchOptions(): { options: SelectOption[]; isLoading: boolean } {
  const http = useHttpClient();
  const params = buildListParams({ perPage: OPTIONS_PAGE_SIZE });

  const query = useQuery({
    queryKey: branchKeys.list({ ...params, purpose: 'options' }),
    queryFn: ({ signal }) => getBranches(http, params, signal),
  });

  return {
    options: (query.data?.data ?? []).map((branch) => ({
      value: String(branch.id),
      label: branch.name,
    })),
    isLoading: query.isLoading,
  };
}
