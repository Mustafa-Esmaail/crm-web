'use client';

import { Button, Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { Handshake, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import {
  DEAL_BOARD_LIMIT,
  DEAL_DEFAULT_PAGE_SIZE,
  DEAL_FILTER_IDS,
  DEAL_VIEWS,
} from '../constants';
import { useDealFilters } from '../hooks/use-deal-filters';
import { useDealPipeline, useDealsQuery } from '../hooks/use-deal-queries';
import type { Deal } from '../types';
import type { DealActions } from './deal-actions-menu';
import { DealAssignDialog } from './deal-assign-dialog';
import { DealBoard } from './deal-board';
import { createDealColumns } from './deal-columns';
import { DealFormDialog } from './deal-form-dialog';
import { DealStageDialog } from './deal-stage-dialog';
import { DeleteDealDialog } from './delete-deal-dialog';

const NO_ROWS: Deal[] = [];

/** `null` = closed; `{ deal: null }` = creating; `{ deal }` = editing that deal. */
type FormTarget = { deal: Deal | null } | null;

export function DealsPageContent() {
  const t = useTranslations('deals');
  const tNav = useTranslations('nav');
  const [view, setView] = useQueryState(
    'view',
    parseAsStringLiteral(DEAL_VIEWS).withDefault('board').withOptions({ history: 'replace' }),
  );
  const list = useListParams({
    filterIds: DEAL_FILTER_IDS,
    defaultPerPage: DEAL_DEFAULT_PAGE_SIZE,
  });
  const filters = useDealFilters();
  const pipeline = useDealPipeline();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [stageTarget, setStageTarget] = useState<Deal | null>(null);
  const [assignTarget, setAssignTarget] = useState<Deal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);

  const isBoard = view === 'board';
  // The board shows every stage at once, so it ignores the stage chip and pages; the list uses both.
  const query = useDealsQuery({
    search: list.search,
    page: isBoard ? 1 : list.page,
    perPage: isBoard ? DEAL_BOARD_LIMIT : list.perPage,
    stageId: isBoard ? null : list.filters.stage_id,
    status: list.filters.status,
    ownerId: list.filters.owner_id,
  });

  // Stable identity: columns are rebuilt from this, so a fresh object per render would redo them.
  const actions: DealActions = useMemo(
    () => ({
      onEdit: (deal) => setFormTarget({ deal }),
      onChangeStage: setStageTarget,
      onAssign: setAssignTarget,
      onDelete: setDeleteTarget,
    }),
    [],
  );
  const columns = useMemo(() => createDealColumns({ t, actions }), [t, actions]);

  const boardFilters = isBoard ? filters.filter((filter) => filter.id !== 'stage_id') : filters;
  const isFiltered = list.search !== '' || Object.values(list.filters).some(Boolean);
  const totalOnBoard = query.data?.meta.total ?? 0;

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
          <Tabs value={view} onValueChange={(value) => void setView(value as typeof view)}>
            <TabsList>
              {DEAL_VIEWS.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {t(`views.${value}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Can permission={PERMISSIONS.dealsCreate}>
            <Button onClick={() => setFormTarget({ deal: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      {isBoard ? (
        <>
          <div className="bg-card shadow-card mb-4 overflow-hidden rounded-lg border">
            <DataTable.Toolbar
              searchValue={list.search}
              onSearchChange={list.setSearch}
              searchPlaceholder={t('searchPlaceholder')}
              filters={boardFilters}
              filterValues={list.filters}
              onFilterChange={list.setFilter}
              onClearAll={() => {
                list.setSearch('');
                list.clearFilters();
              }}
            />
          </div>
          {totalOnBoard > DEAL_BOARD_LIMIT && (
            <p className="bg-warning-soft text-warning text-small mb-4 rounded-md px-3 py-2">
              {t('board.limit', { limit: DEAL_BOARD_LIMIT, total: totalOnBoard })}
            </p>
          )}
          <DealBoard
            stages={pipeline.data}
            deals={query.data?.data ?? NO_ROWS}
            isLoading={query.isLoading || pipeline.isLoading}
            error={query.error ?? pipeline.error}
            onRetry={() => {
              void query.refetch();
              void pipeline.refetch();
            }}
            actions={actions}
          />
        </>
      ) : (
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
            getRowId={(deal) => String(deal.id)}
            isLoading={query.isLoading}
            error={query.error}
            onRetry={() => void query.refetch()}
            emptyState={
              <EmptyState
                icon={Handshake}
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
      )}

      {formTarget && (
        <DealFormDialog
          key={formTarget.deal?.id ?? 'new'}
          deal={formTarget.deal}
          onClose={() => setFormTarget(null)}
        />
      )}
      {stageTarget && <DealStageDialog deal={stageTarget} onClose={() => setStageTarget(null)} />}
      {assignTarget && (
        <DealAssignDialog deal={assignTarget} onClose={() => setAssignTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteDealDialog deal={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
