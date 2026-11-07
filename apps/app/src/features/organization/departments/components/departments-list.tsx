'use client';

import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useBranchOptions } from '@/features/organization/branches';
import { DataTable } from '@/shared/components/data-table/data-table';
import type { ColumnVisibility } from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';

import { DEPARTMENT_FILTER_IDS } from '../constants';
import { useDepartmentsQuery } from '../hooks/use-departments-queries';
import type { Department } from '../types';
import { createDepartmentFilters } from '../utils/mappers';
import type { DepartmentActions } from './department-actions-menu';
import { createDepartmentColumns } from './department-columns';

const NO_ROWS: Department[] = [];

export function DepartmentsList({ actions }: { actions: DepartmentActions }) {
  const t = useTranslations('departments');
  const list = useListParams({ filterIds: DEPARTMENT_FILTER_IDS });
  const branches = useBranchOptions();
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const query = useDepartmentsQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    filters: { branch_id: list.filters.branch_id },
  });

  const columns = useMemo(() => createDepartmentColumns({ t, actions }), [t, actions]);
  const filters = useMemo(
    () => createDepartmentFilters(t, branches.options, branches.isLoading),
    [t, branches.options, branches.isLoading],
  );

  const isFiltered = list.search !== '' || Boolean(list.filters.branch_id);

  return (
    <>
      <DataTable.Toolbar
        searchValue={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder={t('searchPlaceholder')}
        filters={filters}
        filterValues={list.filters}
        onFilterChange={list.setFilter}
        onClearAll={() => {
          list.setSearch('');
          list.clearFilters();
        }}
      />
      <DataTable.Content
        columns={columns}
        data={query.data?.data ?? NO_ROWS}
        getRowId={(department) => String(department.id)}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        emptyState={
          <EmptyState
            icon={Building2}
            title={isFiltered ? t('empty.filteredTitle') : t('empty.title')}
            description={isFiltered ? t('empty.filteredDescription') : t('empty.description')}
          />
        }
      />
      <DataTable.Pagination
        meta={query.data?.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
      />
    </>
  );
}
