'use client';

import { Button } from '@crm/ui';
import { Briefcase, CircleDot, Package, Pencil, Trash2 } from 'lucide-react';
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
import { Amount } from '@/shared/components/display/amount';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { DeleteRecordDialog } from '@/shared/components/feedback/delete-record-dialog';
import { ListPage } from '@/shared/components/layout/list-page';
import { useCan } from '@/shared/hooks/use-can';
import { useHasIndustry } from '@/shared/hooks/use-industry';

import { AGENCY_PAGE_SIZE, ENGAGEMENT_FILTER_IDS } from '../constants';
import { useDeleteEngagement } from '../hooks/use-agency-mutations';
import { useEngagementsQuery, usePackageOptions } from '../hooks/use-agency-queries';
import { type Engagement, ENGAGEMENT_STATUSES } from '../types';
import { EngagementFormDialog } from './engagement-form-dialog';

const NO_ROWS: Engagement[] = [];
const helper = createDataTableColumnHelper<Engagement>();

export function EngagementsPage() {
  const t = useTranslations('agency.engagements');
  const tNav = useTranslations('nav');
  const isAgency = useHasIndustry(INDUSTRIES.agency);
  const canView = useCan(PERMISSIONS.agencyEngagementsView) && isAgency;
  const canManage = useCan(PERMISSIONS.agencyEngagementsManage) && isAgency;
  const list = useListParams({
    filterIds: ENGAGEMENT_FILTER_IDS,
    defaultPerPage: AGENCY_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<{ engagement: Engagement | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Engagement | null>(null);
  const remove = useDeleteEngagement();

  const query = useEngagementsQuery(
    {
      page: list.page,
      perPage: list.perPage,
      filters: { status: list.filters.status, package_id: list.filters.package_id },
    },
    canView,
  );

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('fields.status'),
        icon: CircleDot,
        options: ENGAGEMENT_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
      {
        id: 'package_id',
        label: t('fields.package'),
        icon: Package,
        options: [],
        useOptions: usePackageOptions,
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'lead',
          header: t('columns.lead'),
          cell: ({ row }) => <LeadLink id={row.original.lead_id} />,
        }),
        helper.display({
          id: 'package',
          header: t('columns.package'),
          cell: ({ row }) => (
            <span className="block truncate font-semibold">
              {row.original.package?.name ?? '—'}
            </span>
          ),
        }),
        helper.display({
          id: 'fee',
          header: t('columns.monthlyFee'),
          cell: ({ row }) => <Amount value={row.original.monthly_fee} />,
        }),
        helper.display({
          id: 'period',
          header: t('columns.period'),
          cell: ({ row }) => (
            <span className="whitespace-nowrap">
              <FormattedDate value={row.original.starts_on} pattern="PP" />
              {' – '}
              <FormattedDate value={row.original.ends_on} pattern="PP" />
            </span>
          ),
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`engagement_${row.original.status}`} />,
        }),
      ]),
      ...(canManage
        ? [
            createActionsColumn<Engagement>((engagement) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')} #${engagement.id}`}
                  onClick={() => setFormTarget({ engagement })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')} #${engagement.id}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(engagement);
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
          ? { label: t('actions.create'), onClick: () => setFormTarget({ engagement: null }) }
          : undefined
      }
      filters={filters}
      filterValues={list.filters}
      onFilterChange={list.setFilter}
      onClearAll={list.clearFilters}
      columns={columns}
      rows={query.data?.data ?? NO_ROWS}
      getRowId={(engagement) => String(engagement.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: Briefcase,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <EngagementFormDialog
          key={formTarget.engagement?.id ?? 'new'}
          engagement={formTarget.engagement}
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
