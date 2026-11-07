'use client';

import { isApiError } from '@crm/api-client';
import { Button } from '@crm/ui';
import { Building, Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { useProjectOptions } from '@/features/real-estate/projects';
import { Can } from '@/shared/components/auth/can';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import { DataTable } from '@/shared/components/data-table/data-table';
import {
  createDataTableColumnHelper,
  type FilterDefinition,
} from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import { BUILDING_DEFAULT_PAGE_SIZE, BUILDING_FILTER_IDS } from '../constants';
import { useBuildingsQuery, useDeleteBuilding } from '../hooks/use-buildings';
import type { Building as BuildingRow } from '../types';
import { BuildingFormDialog } from './building-form-dialog';

const NO_ROWS: BuildingRow[] = [];
const helper = createDataTableColumnHelper<BuildingRow>();

type FormTarget = { building: BuildingRow | null } | null;

function RowActions({
  building,
  onEdit,
  onDelete,
}: {
  building: BuildingRow;
  onEdit: (building: BuildingRow) => void;
  onDelete: (building: BuildingRow) => void;
}) {
  const t = useTranslations('buildings.actions');
  if (!useCan(PERMISSIONS.buildingsManage)) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`${t('edit')}: ${building.name}`}
        onClick={() => onEdit(building)}
      >
        <Pencil aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`${t('delete')}: ${building.name}`}
        onClick={() => onDelete(building)}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  );
}

export function BuildingsPageContent() {
  const t = useTranslations('buildings');
  const tNav = useTranslations('nav');
  const list = useListParams({
    filterIds: BUILDING_FILTER_IDS,
    defaultPerPage: BUILDING_DEFAULT_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildingRow | null>(null);
  const remove = useDeleteBuilding();

  const query = useBuildingsQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    projectId: list.filters.project_id,
  });

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'project_id',
        label: t('fields.project'),
        icon: Building,
        options: [],
        useOptions: useProjectOptions,
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'name',
          header: t('columns.building'),
          cell: ({ row }) => (
            <div className="min-w-0">
              <span className="block truncate font-semibold">{row.original.name}</span>
              {row.original.code && (
                <span className="text-caption text-text-faint">{row.original.code}</span>
              )}
            </div>
          ),
        }),
        helper.display({
          id: 'project',
          header: t('columns.project'),
          cell: ({ row }) => row.original.project.name,
        }),
        helper.display({
          id: 'floors',
          header: t('columns.floors'),
          cell: ({ row }) => <span className="num">{row.original.floors_count ?? '—'}</span>,
        }),
        helper.display({
          id: 'units',
          header: t('columns.units'),
          cell: ({ row }) => <span className="num">{row.original.units_count ?? 0}</span>,
        }),
      ]),
      createActionsColumn<BuildingRow>((building) => (
        <RowActions
          building={building}
          onEdit={(target) => setFormTarget({ building: target })}
          onDelete={setDeleteTarget}
        />
      )),
    ],
    [t],
  );

  const isFiltered = list.search !== '' || Object.values(list.filters).some(Boolean);
  const refusal =
    isApiError(remove.error) && remove.error.status === 422
      ? (Object.values(remove.error.fieldErrors)[0]?.[0] ?? remove.error.message)
      : null;

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.sales') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.buildingsManage}>
            <Button onClick={() => setFormTarget({ building: null })}>
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
        />
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(building) => String(building.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
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
      </DataTable>

      {formTarget && (
        <BuildingFormDialog
          key={formTarget.building?.id ?? 'new'}
          building={formTarget.building}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          open
          onOpenChange={(isOpen) => !isOpen && !remove.isPending && setDeleteTarget(null)}
          tone="destructive"
          title={t('delete.title', { name: deleteTarget.name })}
          description={t('delete.description')}
          confirmLabel={t('delete.confirm')}
          isPending={remove.isPending}
          errorMessage={refusal}
          onConfirm={() =>
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          }
        />
      )}
    </>
  );
}
