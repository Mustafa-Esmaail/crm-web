'use client';

import { Button } from '@crm/ui';
import { GitBranch, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import type { ColumnVisibility } from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import { BRANCH_FILTER_IDS, BRANCH_TOGGLEABLE_COLUMNS } from '../constants';
import { useBranchesQuery } from '../hooks/use-branches-query';
import type { Branch } from '../types';
import { createBranchFilters } from '../utils/mappers';
import { createBranchColumns } from './branch-columns';
import { BranchFormDialog } from './branch-form-dialog';
import { DeleteBranchDialog } from './delete-branch-dialog';

const NO_ROWS: Branch[] = [];

/** `null` = closed; `{ branch: null }` = creating; `{ branch }` = editing that branch. */
type FormTarget = { branch: Branch | null } | null;

export function BranchesPageContent() {
  const t = useTranslations('branches');
  const tNav = useTranslations('nav');
  const list = useListParams({ filterIds: BRANCH_FILTER_IDS });
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const query = useBranchesQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    filters: { is_active: list.filters.is_active },
  });

  const columns = useMemo(
    () =>
      createBranchColumns({
        t,
        onEdit: (branch) => setFormTarget({ branch }),
        onDelete: setDeleteTarget,
      }),
    [t],
  );
  const filters = useMemo(() => createBranchFilters(t), [t]);

  const isFiltered = list.search !== '' || Boolean(list.filters.is_active);

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.organization') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.branchesManage}>
            <Button onClick={() => setFormTarget({ branch: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      <DataTable>
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
          columnToggle={{
            columns: BRANCH_TOGGLEABLE_COLUMNS.map(({ id, labelKey }) => ({
              id,
              label: t(`columns.${labelKey}`),
            })),
            visibility: columnVisibility,
            onVisibilityChange: (id, isVisible) =>
              setColumnVisibility((current) => ({ ...current, [id]: isVisible })),
          }}
        />
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(branch) => String(branch.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          emptyState={
            <EmptyState
              icon={GitBranch}
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
      </DataTable>

      {formTarget && (
        <BranchFormDialog
          key={formTarget.branch?.id ?? 'new'}
          branch={formTarget.branch}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteBranchDialog branch={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
