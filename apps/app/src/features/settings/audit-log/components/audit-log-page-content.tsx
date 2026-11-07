'use client';

import { Input } from '@crm/ui';
import { Activity, Layers, Tag, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { type AuditLog, useAuditLogsQuery } from '@/features/audit';
import { useEmployeeName, useEmployeeOptions } from '@/features/organization/employees';
import { DataTable } from '@/shared/components/data-table/data-table';
import type { FilterDefinition } from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import {
  AUDIT_ACTIONS,
  AUDIT_DEFAULT_PAGE_SIZE,
  AUDIT_FILTER_IDS,
  AUDIT_MODULES,
} from '../constants';
import { createAuditLogColumns } from './audit-log-columns';
import { AuditLogDrawer } from './audit-log-drawer';

const NO_ROWS: AuditLog[] = [];

export function AuditLogPageContent() {
  const t = useTranslations('auditLog');
  const tNav = useTranslations('nav');
  const list = useListParams({
    filterIds: AUDIT_FILTER_IDS,
    defaultPerPage: AUDIT_DEFAULT_PAGE_SIZE,
  });
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const { action, module, user_id: userId, from, to } = list.filters;
  const query = useAuditLogsQuery({
    page: list.page,
    perPage: list.perPage,
    action,
    module,
    userId,
    from,
    to,
  });

  const columns = useMemo(
    () =>
      createAuditLogColumns({
        t,
        getModuleLabel: (value) => (t.has(`modules.${value}`) ? t(`modules.${value}`) : value),
        onView: setSelected,
      }),
    [t],
  );

  const filters = useMemo<FilterDefinition[]>(
    () => [
      {
        id: 'action',
        label: t('filters.action'),
        icon: Activity,
        options: AUDIT_ACTIONS.map((value) => ({ value, label: t(`actions.${value}`) })),
      },
      {
        id: 'module',
        label: t('filters.module'),
        icon: Layers,
        options: AUDIT_MODULES.map((value) => ({ value, label: t(`modules.${value}`) })),
      },
      {
        // Employees are the API's users, so an employee id is a valid user_id.
        id: 'user_id',
        label: t('filters.user'),
        icon: UserRound,
        options: [],
        useOptions: useEmployeeOptions,
        useSelectedLabel: useEmployeeName,
      },
    ],
    [t],
  );

  const isFiltered = Object.values(list.filters).some(Boolean);

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('items.settings') },
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
        >
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label={t('filters.from')}
              value={from ?? ''}
              max={to ?? undefined}
              onChange={(event) => list.setFilter('from', event.target.value || null)}
              className="ltr-field h-chip w-40"
            />
            <span className="text-muted-foreground text-small">–</span>
            <Input
              type="date"
              aria-label={t('filters.to')}
              value={to ?? ''}
              min={from ?? undefined}
              onChange={(event) => list.setFilter('to', event.target.value || null)}
              className="ltr-field h-chip w-40"
            />
          </div>
        </DataTable.Toolbar>
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(log) => String(log.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          emptyState={
            <EmptyState
              icon={Tag}
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

      <AuditLogDrawer log={selected} onClose={() => setSelected(null)} />
    </>
  );
}
