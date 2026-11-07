'use client';

import { Button } from '@crm/ui';
import { Car, CircleDot, Gauge, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { INDUSTRIES } from '@/config/industries';
import { PERMISSIONS } from '@/config/permissions';
import { LeadLink } from '@/features/sales/leads';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type FilterDefinition,
} from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { DeleteRecordDialog } from '@/shared/components/feedback/delete-record-dialog';
import { ListPage } from '@/shared/components/layout/list-page';
import { useCan } from '@/shared/hooks/use-can';
import { useHasIndustry } from '@/shared/hooks/use-industry';

import { AUTOMOTIVE_PAGE_SIZE, TEST_DRIVE_FILTER_IDS } from '../constants';
import { useDeleteTestDrive } from '../hooks/use-automotive-mutations';
import { useTestDrivesQuery, useVehicleOptions } from '../hooks/use-automotive-queries';
import { TEST_DRIVE_STATUSES, type TestDrive } from '../types';
import { vehicleLabel } from '../utils/mappers';
import { TestDriveFormDialog } from './test-drive-form-dialog';

const NO_ROWS: TestDrive[] = [];
const helper = createDataTableColumnHelper<TestDrive>();

export function TestDrivesPage() {
  const t = useTranslations('automotive.testDrives');
  const tNav = useTranslations('nav');
  const isAutomotive = useHasIndustry(INDUSTRIES.automotive);
  const canView = useCan(PERMISSIONS.automotiveTestDrivesView) && isAutomotive;
  const canManage = useCan(PERMISSIONS.automotiveTestDrivesManage) && isAutomotive;
  const list = useListParams({
    filterIds: TEST_DRIVE_FILTER_IDS,
    defaultPerPage: AUTOMOTIVE_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<{ testDrive: TestDrive | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestDrive | null>(null);
  const remove = useDeleteTestDrive();

  const query = useTestDrivesQuery(
    {
      page: list.page,
      perPage: list.perPage,
      filters: { status: list.filters.status, vehicle_id: list.filters.vehicle_id },
    },
    canView,
  );

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('fields.status'),
        icon: CircleDot,
        options: TEST_DRIVE_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
      {
        id: 'vehicle_id',
        label: t('fields.vehicle'),
        icon: Car,
        options: [],
        useOptions: useVehicleOptions,
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'when',
          header: t('columns.when'),
          cell: ({ row }) => (
            <span className="num whitespace-nowrap">
              <FormattedDate value={row.original.starts_at} pattern="PPp" />
            </span>
          ),
        }),
        helper.display({
          id: 'vehicle',
          header: t('columns.vehicle'),
          cell: ({ row }) => (
            <span className="block truncate font-semibold">
              {row.original.vehicle ? vehicleLabel(row.original.vehicle) : '—'}
            </span>
          ),
        }),
        helper.display({
          id: 'lead',
          header: t('columns.lead'),
          cell: ({ row }) => <LeadLink id={row.original.lead_id} />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`booking_${row.original.status}`} />,
        }),
      ]),
      ...(canManage
        ? [
            createActionsColumn<TestDrive>((testDrive) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')} #${testDrive.id}`}
                  onClick={() => setFormTarget({ testDrive })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')} #${testDrive.id}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(testDrive);
                  }}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            )),
          ]
        : []),
    ],
    [t, canManage, remove],
  );

  const isFiltered = Object.values(list.filters).some(Boolean);

  return (
    <ListPage
      title={t('title')}
      description={t('description')}
      sectionLabel={tNav('sections.sales')}
      canView={canView}
      create={
        canManage
          ? { label: t('actions.create'), onClick: () => setFormTarget({ testDrive: null }) }
          : undefined
      }
      filters={filters}
      filterValues={list.filters}
      onFilterChange={list.setFilter}
      onClearAll={list.clearFilters}
      columns={columns}
      rows={query.data?.data ?? NO_ROWS}
      getRowId={(testDrive) => String(testDrive.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: Gauge,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <TestDriveFormDialog
          key={formTarget.testDrive?.id ?? 'new'}
          testDrive={formTarget.testDrive}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRecordDialog
          title={t('delete.title')}
          description={t('delete.description')}
          confirmLabel={t('delete.confirm')}
          isPending={remove.isPending}
          error={remove.error}
          onConfirm={() =>
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          }
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </ListPage>
  );
}
