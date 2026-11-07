'use client';

import { Button } from '@crm/ui';
import { Car, CircleDot, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { INDUSTRIES } from '@/config/industries';
import { PERMISSIONS } from '@/config/permissions';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type FilterDefinition,
} from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { Amount } from '@/shared/components/display/amount';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { DeleteRecordDialog } from '@/shared/components/feedback/delete-record-dialog';
import { ListPage } from '@/shared/components/layout/list-page';
import { useCan } from '@/shared/hooks/use-can';
import { useHasIndustry } from '@/shared/hooks/use-industry';

import { AUTOMOTIVE_PAGE_SIZE, VEHICLE_FILTER_IDS } from '../constants';
import { useDeleteVehicle } from '../hooks/use-automotive-mutations';
import { useVehiclesQuery } from '../hooks/use-automotive-queries';
import { type Vehicle, VEHICLE_STATUSES } from '../types';
import { vehicleLabel } from '../utils/mappers';
import { VehicleFormDialog } from './vehicle-form-dialog';

const NO_ROWS: Vehicle[] = [];
const helper = createDataTableColumnHelper<Vehicle>();

export function VehiclesPage() {
  const t = useTranslations('automotive.vehicles');
  const tNav = useTranslations('nav');
  const isAutomotive = useHasIndustry(INDUSTRIES.automotive);
  const canView = useCan(PERMISSIONS.automotiveVehiclesView) && isAutomotive;
  const canManage = useCan(PERMISSIONS.automotiveVehiclesManage) && isAutomotive;
  const list = useListParams({
    filterIds: VEHICLE_FILTER_IDS,
    defaultPerPage: AUTOMOTIVE_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<{ vehicle: Vehicle | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const remove = useDeleteVehicle();

  const query = useVehiclesQuery(
    {
      search: list.search,
      page: list.page,
      perPage: list.perPage,
      filters: { status: list.filters.status },
    },
    canView,
  );

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('fields.status'),
        icon: CircleDot,
        options: VEHICLE_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'vehicle',
          header: t('columns.vehicle'),
          cell: ({ row }) => (
            <div className="min-w-0">
              <span className="block truncate font-semibold">{vehicleLabel(row.original)}</span>
              {row.original.vin && (
                <span className="text-caption text-text-faint num" dir="ltr">
                  {row.original.vin}
                </span>
              )}
            </div>
          ),
        }),
        helper.display({
          id: 'color',
          header: t('columns.color'),
          cell: ({ row }) => row.original.color ?? '—',
        }),
        helper.display({
          id: 'price',
          header: t('columns.price'),
          cell: ({ row }) => <Amount value={row.original.price} />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`vehicle_${row.original.status}`} />,
        }),
      ]),
      ...(canManage
        ? [
            createActionsColumn<Vehicle>((vehicle) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')}: ${vehicleLabel(vehicle)}`}
                  onClick={() => setFormTarget({ vehicle })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')}: ${vehicleLabel(vehicle)}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(vehicle);
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

  const isFiltered = list.search !== '' || Object.values(list.filters).some(Boolean);

  return (
    <ListPage
      title={t('title')}
      description={t('description')}
      sectionLabel={tNav('sections.sales')}
      canView={canView}
      create={
        canManage
          ? { label: t('actions.create'), onClick: () => setFormTarget({ vehicle: null }) }
          : undefined
      }
      search={{ value: list.search, onChange: list.setSearch, placeholder: t('searchPlaceholder') }}
      filters={filters}
      filterValues={list.filters}
      onFilterChange={list.setFilter}
      onClearAll={() => {
        list.setSearch('');
        list.clearFilters();
      }}
      columns={columns}
      rows={query.data?.data ?? NO_ROWS}
      getRowId={(vehicle) => String(vehicle.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: Car,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <VehicleFormDialog
          key={formTarget.vehicle?.id ?? 'new'}
          vehicle={formTarget.vehicle}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRecordDialog
          title={t('delete.title', { name: vehicleLabel(deleteTarget) })}
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
