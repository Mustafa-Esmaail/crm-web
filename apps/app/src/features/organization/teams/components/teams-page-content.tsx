'use client';

import { Button } from '@crm/ui';
import { Plus, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { useDepartmentOptions } from '@/features/organization/departments';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import type { ColumnVisibility } from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import { TEAM_FILTER_IDS, TEAM_TOGGLEABLE_COLUMNS } from '../constants';
import { useTeamsQuery } from '../hooks/use-teams-query';
import type { Team } from '../types';
import { createTeamFilters } from '../utils/mappers';
import { DeleteTeamDialog } from './delete-team-dialog';
import { createTeamColumns } from './team-columns';
import { TeamFormDialog } from './team-form-dialog';

const NO_ROWS: Team[] = [];

/** `null` = closed; `{ team: null }` = creating; `{ team }` = editing that team. */
type FormTarget = { team: Team | null } | null;

export function TeamsPageContent() {
  const t = useTranslations('teams');
  const tNav = useTranslations('nav');
  const list = useListParams({ filterIds: TEAM_FILTER_IDS });
  const departments = useDepartmentOptions();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const query = useTeamsQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    filters: { department_id: list.filters.department_id },
  });

  const columns = useMemo(
    () =>
      createTeamColumns({
        t,
        onEdit: (team) => setFormTarget({ team }),
        onDelete: setDeleteTarget,
      }),
    [t],
  );
  const filters = useMemo(
    () => createTeamFilters(t, departments.options, departments.isLoading),
    [t, departments.options, departments.isLoading],
  );

  const isFiltered = list.search !== '' || Boolean(list.filters.department_id);

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.organization') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.teamsManage}>
            <Button onClick={() => setFormTarget({ team: null })}>
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
          columnToggle={{
            columns: TEAM_TOGGLEABLE_COLUMNS.map(({ id, labelKey }) => ({
              id,
              label: t(`columns.${labelKey}`),
            })),
            visibility: columnVisibility,
            onVisibilityChange: (id, isVisible) =>
              setColumnVisibility((current) => ({ ...current, [id]: isVisible })),
          }}
        />
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(team) => String(team.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          emptyState={
            <EmptyState
              icon={UsersRound}
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
        <TeamFormDialog
          key={formTarget.team?.id ?? 'new'}
          team={formTarget.team}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteTeamDialog team={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
