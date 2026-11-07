'use client';

import { Button } from '@crm/ui';
import { ListChecks, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import { TASK_DEFAULT_PAGE_SIZE, TASK_FILTER_IDS } from '../constants';
import { useTaskFilters } from '../hooks/use-task-filters';
import { useToggleTask } from '../hooks/use-task-mutations';
import { useTasksQuery } from '../hooks/use-task-queries';
import type { Task } from '../types';
import { DeleteTaskDialog } from './delete-task-dialog';
import { TaskAssignDialog } from './task-assign-dialog';
import { createTaskColumns, type TaskActions } from './task-columns';
import { TaskFormDialog } from './task-form-dialog';

const NO_ROWS: Task[] = [];

/** `null` = closed; `{ task: null }` = creating; `{ task }` = editing. */
type FormTarget = { task: Task | null } | null;

export function TasksPageContent() {
  const t = useTranslations('tasks');
  const tNav = useTranslations('nav');
  const list = useListParams({
    filterIds: TASK_FILTER_IDS,
    defaultPerPage: TASK_DEFAULT_PAGE_SIZE,
  });
  const filters = useTaskFilters();
  const toggle = useToggleTask();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [assignTarget, setAssignTarget] = useState<Task | null>(null);

  const query = useTasksQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    status: list.filters.status,
    priority: list.filters.priority,
    ownerId: list.filters.owner_id,
  });

  const { mutate: toggleTask } = toggle;
  const actions: TaskActions = useMemo(
    () => ({
      onToggle: (task) => toggleTask({ id: task.id, done: task.status !== 'done' }),
      onEdit: (task) => setFormTarget({ task }),
      onAssign: setAssignTarget,
      onDelete: setDeleteTarget,
    }),
    [toggleTask],
  );
  const columns = useMemo(() => createTaskColumns({ t, actions }), [t, actions]);
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
          <Can permission={PERMISSIONS.tasksCreate}>
            <Button onClick={() => setFormTarget({ task: null })}>
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
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(task) => String(task.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          emptyState={
            <EmptyState
              icon={ListChecks}
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
        <TaskFormDialog
          key={formTarget.task?.id ?? 'new'}
          task={formTarget.task}
          onClose={() => setFormTarget(null)}
        />
      )}
      {assignTarget && (
        <TaskAssignDialog task={assignTarget} onClose={() => setAssignTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteTaskDialog task={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
