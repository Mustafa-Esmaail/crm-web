'use client';

import { Button } from '@crm/ui';
import { Check, Download, FileDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import { DataTable } from '@/shared/components/data-table/data-table';
import {
  createDataTableColumnHelper,
  type FilterDefinition,
} from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import { useDownloadExport, useExportRequestsQuery } from '../hooks/use-export-requests';
import { EXPORT_STATUSES, type ExportRequest } from '../types';
import { DecisionDialog } from './decision-dialog';

const NO_ROWS: ExportRequest[] = [];
const helper = createDataTableColumnHelper<ExportRequest>();
const FILTER_IDS = ['status'] as const;

type DecisionTarget = { request: ExportRequest; decision: 'approve' | 'reject' } | null;

function RowActions({
  request,
  onDecide,
}: {
  request: ExportRequest;
  onDecide: (request: ExportRequest, decision: 'approve' | 'reject') => void;
}) {
  const t = useTranslations('exportRequests.actions');
  const canApprove = useCan(PERMISSIONS.leadsApproveExport);
  const download = useDownloadExport();

  return (
    <div className="flex items-center gap-1">
      {request.downloadable && (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={download.isPending}
          aria-label={`${t('download')} #${request.id}`}
          onClick={() => download.mutate(request.id)}
        >
          <Download aria-hidden />
        </Button>
      )}
      {canApprove && request.status === 'pending' && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${t('approve')} #${request.id}`}
            onClick={() => onDecide(request, 'approve')}
          >
            <Check aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${t('reject')} #${request.id}`}
            onClick={() => onDecide(request, 'reject')}
          >
            <X aria-hidden />
          </Button>
        </>
      )}
    </div>
  );
}

export function ExportRequestsPage() {
  const t = useTranslations('exportRequests');
  const tNav = useTranslations('nav');
  const list = useListParams({ filterIds: FILTER_IDS, defaultPerPage: 15 });
  const [target, setTarget] = useState<DecisionTarget>(null);
  const query = useExportRequestsQuery({
    page: list.page,
    perPage: list.perPage,
    status: list.filters.status,
  });

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('columns.status'),
        icon: FileDown,
        options: EXPORT_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'requested_by',
          header: t('columns.requestedBy'),
          cell: ({ row }) => row.original.requested_by?.name ?? '—',
        }),
        helper.display({
          id: 'created_at',
          header: t('columns.requestedAt'),
          cell: ({ row }) => <FormattedDate value={row.original.created_at} />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`export_${row.original.status}`} />,
        }),
        helper.display({
          id: 'decided_by',
          header: t('columns.decidedBy'),
          cell: ({ row }) => (
            <div className="min-w-0">
              <span className="block truncate">{row.original.decided_by?.name ?? '—'}</span>
              {row.original.decision_note && (
                <span className="text-caption text-text-faint block truncate">
                  {row.original.decision_note}
                </span>
              )}
            </div>
          ),
        }),
      ]),
      createActionsColumn<ExportRequest>((request) => (
        <RowActions
          request={request}
          onDecide={(r, decision) => setTarget({ request: r, decision })}
        />
      )),
    ],
    [t],
  );

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.admin') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      <DataTable>
        <DataTable.Toolbar
          searchValue=""
          onSearchChange={() => undefined}
          searchPlaceholder=""
          hideSearch
          filters={filters}
          filterValues={list.filters}
          onFilterChange={list.setFilter}
          onClearAll={list.clearFilters}
        />
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(request) => String(request.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          emptyState={
            <EmptyState
              icon={FileDown}
              title={t('empty.title')}
              description={t('empty.description')}
            />
          }
        />
        <DataTable.Pagination
          meta={query.data?.meta}
          onPageChange={list.setPage}
          onPerPageChange={list.setPerPage}
        />
      </DataTable>

      {target && (
        <DecisionDialog
          request={target.request}
          decision={target.decision}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}
