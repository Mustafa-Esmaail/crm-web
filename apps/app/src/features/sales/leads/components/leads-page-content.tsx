'use client';

import { Button } from '@crm/ui';
import { Plus, Target, UserRoundCheck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
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

import { LEAD_DEFAULT_PAGE_SIZE, LEAD_FILTER_IDS } from '../constants';
import { useLeadFilters } from '../hooks/use-lead-filters';
import { useLeadsQuery } from '../hooks/use-lead-queries';
import type { Lead } from '../types';
import { AssignLeadsDialog } from './assign-leads-dialog';
import { ChangeStageDialog } from './change-stage-dialog';
import { DeleteLeadDialog } from './delete-lead-dialog';
import type { LeadActions } from './lead-actions-menu';
import { createLeadColumns } from './lead-columns';
import { LeadFormDialog } from './lead-form-dialog';
import { LeadTransferActions } from './lead-transfer-actions';

const NO_ROWS: Lead[] = [];

/** `null` = closed; `{ lead: null }` = creating; `{ lead }` = editing that lead. */
type FormTarget = { lead: Lead | null } | null;
/** One lead from the row menu, or the ids ticked in the table. */
type AssignTarget = { leadIds: number[]; leadName?: string } | null;

export function LeadsPageContent() {
  const t = useTranslations('leads');
  const tNav = useTranslations('nav');
  const canAssign = useCan(PERMISSIONS.leadsAssign);
  const list = useListParams({
    filterIds: LEAD_FILTER_IDS,
    defaultPerPage: LEAD_DEFAULT_PAGE_SIZE,
  });
  const filters = useLeadFilters();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [stageTarget, setStageTarget] = useState<Lead | null>(null);
  const [assignTarget, setAssignTarget] = useState<AssignTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelection>({});

  const query = useLeadsQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    stageId: list.filters.stage_id,
    sourceId: list.filters.source_id,
    ownerId: list.filters.owner_id,
    teamId: list.filters.team_id,
    unassigned: list.filters.unassigned,
  });

  // Stable identity: columns are rebuilt from this, so a fresh object per render would redo them.
  const actions: LeadActions = useMemo(
    () => ({
      onEdit: (lead) => setFormTarget({ lead }),
      onChangeStage: setStageTarget,
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

      {formTarget && (
        <LeadFormDialog
          key={formTarget.lead?.id ?? 'new'}
          lead={formTarget.lead}
          onClose={() => setFormTarget(null)}
        />
      )}
      {stageTarget && <ChangeStageDialog lead={stageTarget} onClose={() => setStageTarget(null)} />}
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
