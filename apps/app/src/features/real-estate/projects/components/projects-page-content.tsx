'use client';

import { Button } from '@crm/ui';
import { Building, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
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

import { PROJECT_DEFAULT_PAGE_SIZE, PROJECT_FILTER_IDS } from '../constants';
import { useProjectsQuery } from '../hooks/use-project-queries';
import { type Project, PROJECT_STATUSES } from '../types';
import { DeleteProjectDialog } from './delete-project-dialog';
import { ProjectFormDialog } from './project-form-dialog';

const NO_ROWS: Project[] = [];
const helper = createDataTableColumnHelper<Project>();

type FormTarget = { project: Project | null } | null;

function RowActions({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const t = useTranslations('projects.actions');
  const canManage = useCan(PERMISSIONS.projectsManage);
  if (!canManage) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`${t('edit')}: ${project.name}`}
        onClick={() => onEdit(project)}
      >
        <Pencil aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`${t('delete')}: ${project.name}`}
        onClick={() => onDelete(project)}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  );
}

export function ProjectsPageContent() {
  const t = useTranslations('projects');
  const tNav = useTranslations('nav');
  const list = useListParams({
    filterIds: PROJECT_FILTER_IDS,
    defaultPerPage: PROJECT_DEFAULT_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const query = useProjectsQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    status: list.filters.status,
  });

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('fields.status'),
        icon: Building,
        options: PROJECT_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'name',
          header: t('columns.project'),
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
          id: 'location',
          header: t('columns.location'),
          cell: ({ row }) =>
            [row.original.city, row.original.district].filter(Boolean).join(' · ') || '—',
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`project_${row.original.status}`} />,
        }),
        helper.display({
          id: 'units',
          header: t('columns.units'),
          cell: ({ row }) => (
            <span className="num">
              {t('availableOf', {
                available: row.original.available_units_count ?? 0,
                total: row.original.units_count ?? 0,
              })}
            </span>
          ),
        }),
        helper.display({
          id: 'delivery',
          header: t('columns.delivery'),
          cell: ({ row }) => <FormattedDate value={row.original.delivery_date} />,
        }),
      ]),
      createActionsColumn<Project>((project) => (
        <RowActions
          project={project}
          onEdit={(target) => setFormTarget({ project: target })}
          onDelete={setDeleteTarget}
        />
      )),
    ],
    [t],
  );

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
          <Can permission={PERMISSIONS.projectsManage}>
            <Button onClick={() => setFormTarget({ project: null })}>
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
          getRowId={(project) => String(project.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          emptyState={
            <EmptyState
              icon={Building}
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
        <ProjectFormDialog
          key={formTarget.project?.id ?? 'new'}
          project={formTarget.project}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteProjectDialog project={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
