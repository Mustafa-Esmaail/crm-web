'use client';

import { Button } from '@crm/ui';
import { CircleCheck, Package, Pencil, Trash2 } from 'lucide-react';
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

import { AGENCY_PAGE_SIZE, PACKAGE_FILTER_IDS } from '../constants';
import { useDeletePackage } from '../hooks/use-agency-mutations';
import { usePackagesQuery } from '../hooks/use-agency-queries';
import type { AgencyPackage } from '../types';
import { PackageFormDialog } from './package-form-dialog';

const NO_ROWS: AgencyPackage[] = [];
const helper = createDataTableColumnHelper<AgencyPackage>();

export function PackagesPage() {
  const t = useTranslations('agency.packages');
  const tNav = useTranslations('nav');
  const isAgency = useHasIndustry(INDUSTRIES.agency);
  const canView = useCan(PERMISSIONS.agencyPackagesView) && isAgency;
  const canManage = useCan(PERMISSIONS.agencyPackagesManage) && isAgency;
  const list = useListParams({ filterIds: PACKAGE_FILTER_IDS, defaultPerPage: AGENCY_PAGE_SIZE });
  const [formTarget, setFormTarget] = useState<{ pkg: AgencyPackage | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgencyPackage | null>(null);
  const remove = useDeletePackage();

  const query = usePackagesQuery(
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
          header: t('columns.package'),
          cell: ({ row }) => (
            <div className="min-w-0">
              <span className="block truncate font-semibold">{row.original.name}</span>
              {row.original.deliverables && (
                <span className="text-caption text-text-faint block truncate">
                  {row.original.deliverables}
                </span>
              )}
            </div>
          ),
        }),
        helper.display({
          id: 'fee',
          header: t('columns.monthlyFee'),
          cell: ({ row }) => <Amount value={row.original.monthly_fee} />,
        }),
        helper.display({
          id: 'engagements',
          header: t('columns.activeEngagements'),
          cell: ({ row }) => <span className="num">{row.original.active_engagements ?? 0}</span>,
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
            createActionsColumn<AgencyPackage>((pkg) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')}: ${pkg.name}`}
                  onClick={() => setFormTarget({ pkg })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')}: ${pkg.name}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(pkg);
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
          ? { label: t('actions.create'), onClick: () => setFormTarget({ pkg: null }) }
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
      getRowId={(pkg) => String(pkg.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: Package,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <PackageFormDialog
          key={formTarget.pkg?.id ?? 'new'}
          pkg={formTarget.pkg}
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
