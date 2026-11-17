'use client';

import { Button, Tabs, TabsList, TabsTrigger } from '@crm/ui';
import { Move, Plus, Target, UserRoundCheck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { buildListParams } from '@/lib/api/list-params';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import type { RowSelection } from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import {
  LEAD_BOARD_LIMIT,
  LEAD_DEFAULT_PAGE_SIZE,
  LEAD_FILTER_IDS,
  LEAD_VIEWS,
  type LeadView,
} from '../constants';
import { useLeadFilters } from '../hooks/use-lead-filters';
import { useChangeLeadStage } from '../hooks/use-lead-mutations';
import { useLeadsQuery, useLeadStages } from '../hooks/use-lead-queries';
import type { Lead, LeadStage } from '../types';
import { AssignLeadsDialog } from './assign-leads-dialog';
import { ChangeStageDialog } from './change-stage-dialog';
import { DeleteLeadDialog } from './delete-lead-dialog';
import type { LeadActions } from './lead-actions-menu';
import { LeadBoard } from './lead-board';
import { createLeadColumns } from './lead-columns';
import { LeadFormDialog } from './lead-form-dialog';
import { LeadTransferActions } from './lead-transfer-actions';

const NO_ROWS: Lead[] = [];

/** `null` = closed; `{ lead: null }` = creating; `{ lead }` = editing that lead. */
type FormTarget = { lead: Lead | null } | null;
/** One lead from the row menu, or the ids ticked in the table. */
type AssignTarget = { leadIds: number[]; leadName?: string } | null;
/** From the row menu, or a drop on a stage that needs more input first. */
type StageTarget = { lead: Lead; initialStageId?: number } | null;

export function LeadsPageContent() {
  const t = useTranslations('leads');
  const tNav = useTranslations('nav');
  const canAssign = useCan(PERMISSIONS.leadsAssign);
  const list = useListParams({
    filterIds: LEAD_FILTER_IDS,
    defaultPerPage: LEAD_DEFAULT_PAGE_SIZE,
  });
  const filters = useLeadFilters();
  const [view, setView] = useQueryState(
    'view',
    parseAsStringLiteral(LEAD_VIEWS).withDefault('list').withOptions({ history: 'replace' }),
  );
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [stageTarget, setStageTarget] = useState<StageTarget>(null);
  const [assignTarget, setAssignTarget] = useState<AssignTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelection>({});
  const canMove = useCan(PERMISSIONS.leadsUpdate);
  const changeStage = useChangeLeadStage();

  const isBoard = view === 'board';
  const stages = useLeadStages();
  // The board shows every stage at once, so it ignores the stage chip and pages; the list uses both.
  const query = useLeadsQuery({
    search: list.search,
    page: isBoard ? 1 : list.page,
    perPage: isBoard ? LEAD_BOARD_LIMIT : list.perPage,
    stageId: isBoard ? null : list.filters.stage_id,
    sourceId: list.filters.source_id,
    ownerId: list.filters.owner_id,
    teamId: list.filters.team_id,
    unassigned: list.filters.unassigned,
  });

  // A lost stage needs a reason, so that drop opens the dialog with the column pre-selected.
  const moveLead = (lead: Lead, stage: LeadStage) => {
    if (stage.is_lost) {
      setStageTarget({ lead, initialStageId: stage.id });
      return;
    }
    changeStage.mutate({ id: lead.id, stageId: stage.id, lostReason: null, stage });
  };

  // Stable identity: columns are rebuilt from this, so a fresh object per render would redo them.
  const actions: LeadActions = useMemo(
    () => ({
      onEdit: (lead) => setFormTarget({ lead }),
      onChangeStage: (lead) => setStageTarget({ lead }),
      onAssign: (lead) => setAssignTarget({ leadIds: [lead.id], leadName: lead.name }),
      onDelete: setDeleteTarget,
    }),
    [],
  );
  const columns = useMemo(() => createLeadColumns({ t, actions }), [t, actions]);

  const selectedIds = Object.keys(rowSelection)
    .filter((id) => rowSelection[id])
    .map(Number);
  const isFiltered = list.search !== '' || Object.values(list.filters).some(Boolean);
  const toolbarFilters = isBoard ? filters.filter((filter) => filter.id !== 'stage_id') : filters;
  const totalOnBoard = query.data?.meta.total ?? 0;
  const toolbar = (
    <DataTable.Toolbar
      searchValue={list.search}
      onSearchChange={list.setSearch}
      searchPlaceholder={t('searchPlaceholder')}
      filters={toolbarFilters}
      filterValues={list.filters}
      onFilterChange={list.setFilter}
      onClearAll={() => {
        list.setSearch('');
        list.clearFilters();
      }}
    />
  );

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
          <Tabs value={view} onValueChange={(value) => void setView(value as LeadView)}>
            <TabsList>
              {LEAD_VIEWS.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {t(`views.${value}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <LeadTransferActions
            exportParams={buildListParams({
              search: list.search,
              filters: {
                stage_id: list.filters.stage_id,
                source_id: list.filters.source_id,
                owner_id: list.filters.owner_id,
                team_id: list.filters.team_id,
                unassigned: list.filters.unassigned,
              },
            })}
          />
          <Can permission={PERMISSIONS.leadsCreate}>
            <Button onClick={() => setFormTarget({ lead: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      {isBoard ? (
        <>
          <div className="bg-card shadow-card mb-4 overflow-hidden rounded-lg border">
            {toolbar}
          </div>
          {totalOnBoard > LEAD_BOARD_LIMIT && (
            <p className="bg-warning-soft text-warning text-small mb-4 rounded-md px-3 py-2">
              {t('board.limit', { limit: LEAD_BOARD_LIMIT, total: totalOnBoard })}
            </p>
          )}
          {canMove && (
            <p className="text-caption text-muted-foreground mb-3 flex items-center gap-1.5">
              <Move className="size-3.5" aria-hidden />
              {t('board.hint')}
            </p>
          )}
          <LeadBoard
            stages={stages.data}
            leads={query.data?.data ?? NO_ROWS}
            isLoading={query.isLoading || stages.isLoading}
            error={query.error ?? stages.error}
            onRetry={() => {
              void query.refetch();
              void stages.refetch();
            }}
            actions={actions}
            canMove={canMove}
            onMove={moveLead}
          />
        </>
      ) : (
        <DataTable>
          {toolbar}
          {selectedIds.length > 0 && (
            <div className="bg-primary-soft text-small flex flex-wrap items-center gap-3 border-b px-4 py-2">
              <span className="text-foreground font-semibold">
                {t('selection.count', { count: selectedIds.length })}
              </span>
              {canAssign && (
                <Button size="sm" onClick={() => setAssignTarget({ leadIds: selectedIds })}>
                  <UserRoundCheck aria-hidden />
                  {t('selection.assign')}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
                <X aria-hidden />
                {t('selection.clear')}
              </Button>
            </div>
          )}
          <DataTable.Content
            columns={columns}
            data={query.data?.data ?? NO_ROWS}
            getRowId={(lead) => String(lead.id)}
            isLoading={query.isLoading}
            error={query.error}
            onRetry={() => void query.refetch()}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            emptyState={
              <EmptyState
                icon={Target}
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
        <LeadFormDialog
          key={formTarget.lead?.id ?? 'new'}
          lead={formTarget.lead}
          onClose={() => setFormTarget(null)}
        />
      )}
      {stageTarget && (
        <ChangeStageDialog
          lead={stageTarget.lead}
          initialStageId={stageTarget.initialStageId}
          onClose={() => setStageTarget(null)}
        />
      )}
      {assignTarget && (
        <AssignLeadsDialog
          leadIds={assignTarget.leadIds}
          leadName={assignTarget.leadName}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => setRowSelection({})}
        />
      )}
      {deleteTarget && (
        <DeleteLeadDialog lead={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
