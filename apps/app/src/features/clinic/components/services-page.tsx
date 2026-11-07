'use client';

import { Button } from '@crm/ui';
import { CircleCheck, Pencil, Stethoscope, Trash2 } from 'lucide-react';
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

import { CLINIC_PAGE_SIZE, SERVICE_FILTER_IDS } from '../constants';
import { useDeleteService } from '../hooks/use-clinic-mutations';
import { useServicesQuery } from '../hooks/use-clinic-queries';
import type { Service } from '../types';
import { ServiceFormDialog } from './service-form-dialog';

const NO_ROWS: Service[] = [];
const helper = createDataTableColumnHelper<Service>();

export function ServicesPage() {
  const t = useTranslations('clinic.services');
  const tNav = useTranslations('nav');
  const isClinic = useHasIndustry(INDUSTRIES.clinic);
  const canView = useCan(PERMISSIONS.clinicServicesView) && isClinic;
  const canManage = useCan(PERMISSIONS.clinicServicesManage) && isClinic;
  const list = useListParams({ filterIds: SERVICE_FILTER_IDS, defaultPerPage: CLINIC_PAGE_SIZE });
  const [formTarget, setFormTarget] = useState<{ service: Service | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const remove = useDeleteService();

  const query = useServicesQuery(
    {
      search: list.search,
      page: list.page,
      perPage: list.perPage,
      filters: { is_active: list.filters.is_active },
    },
    canView,
  );

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'is_active',
        label: t('fields.isActive'),
        icon: CircleCheck,
        options: [
          { value: '1', label: t('active') },
          { value: '0', label: t('inactive') },
        ],
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'name',
          header: t('columns.service'),
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
          id: 'duration',
          header: t('columns.duration'),
          cell: ({ row }) => (
            <span className="num">{t('minutes', { count: row.original.duration_minutes })}</span>
          ),
        }),
        helper.display({
          id: 'price',
          header: t('columns.price'),
          cell: ({ row }) => <Amount value={row.original.price} />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => (
            <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} />
          ),
        }),
      ]),
      ...(canManage
        ? [
            createActionsColumn<Service>((service) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')}: ${service.name}`}
                  onClick={() => setFormTarget({ service })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')}: ${service.name}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(service);
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
          ? { label: t('actions.create'), onClick: () => setFormTarget({ service: null }) }
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
      getRowId={(service) => String(service.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: Stethoscope,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <ServiceFormDialog
          key={formTarget.service?.id ?? 'new'}
          service={formTarget.service}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRecordDialog
          title={t('delete.title', { name: deleteTarget.name })}
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
