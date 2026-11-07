'use client';

import { Button, Switch } from '@crm/ui';
import { Download, Plus, Upload, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { DataTable } from '@/shared/components/data-table/data-table';
import type { ColumnVisibility, RowSelection } from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';

import {
  EMPLOYEE_DEFAULT_PAGE_SIZE,
  EMPLOYEE_FILTER_IDS,
  EMPLOYEE_TOGGLEABLE_COLUMNS,
  INCLUDE_SUB_DEPARTMENTS_ON,
} from '../constants';
import { useEmployeeFilters } from '../hooks/use-employee-filters';
import { useEmployeesQuery } from '../hooks/use-employee-queries';
import type { Employee } from '../types';
import type { EmployeeActions } from './employee-actions-menu';
import { createEmployeeColumns } from './employee-columns';
import { EmployeeFormDialog } from './employee-form-dialog';
import { EmployeeKpis } from './employee-kpis';
import { EmployeeStatusDialog, type StatusAction } from './employee-status-dialog';
import { OffboardDialog } from './offboard-dialog';

const NO_ROWS: Employee[] = [];

/** `null` = closed; `{ employee: null }` = creating; `{ employee }` = editing. */
type FormTarget = { employee: Employee | null } | null;
type StatusTarget = { employee: Employee; action: StatusAction } | null;

export function EmployeesPageContent() {
  const t = useTranslations('employees');
  const tNav = useTranslations('nav');
  const list = useListParams({
    filterIds: EMPLOYEE_FILTER_IDS,
    defaultPerPage: EMPLOYEE_DEFAULT_PAGE_SIZE,
  });
  const filters = useEmployeeFilters();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [statusTarget, setStatusTarget] = useState<StatusTarget>(null);
  const [offboardTarget, setOffboardTarget] = useState<Employee | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelection>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const query = useEmployeesQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    filters: list.filters,
  });

  // Stable identity: columns are rebuilt from this, so a fresh object per render would redo them.
  const actions: EmployeeActions = useMemo(
    () => ({
      onEdit: (employee) => setFormTarget({ employee }),
      onSuspend: (employee) => setStatusTarget({ employee, action: 'suspend' }),
      onActivate: (employee) => setStatusTarget({ employee, action: 'activate' }),
      onOffboard: setOffboardTarget,
    }),
    [],
  );
  const columns = useMemo(() => createEmployeeColumns({ t, actions }), [t, actions]);

  const isFiltered =
    list.search !== '' ||
    EMPLOYEE_FILTER_IDS.some((id) => id !== 'include_sub_departments' && Boolean(list.filters[id]));
  const hasDepartmentFilter = Boolean(list.filters.department_id);

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[{ label: tNav('sections.organization') }, { label: t('title') }]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          {/* No import/export endpoints exist yet; the buttons keep the design's layout. */}
          <Button variant="outline" disabled title={t('comingSoon')}>
            <Upload aria-hidden />
            {t('actions.import')}
          </Button>
          <Button variant="outline" disabled title={t('comingSoon')}>
            <Download aria-hidden />
            {t('actions.export')}
          </Button>
          <Can permission={PERMISSIONS.employeesCreate}>
            <Button onClick={() => setFormTarget({ employee: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      <EmployeeKpis />

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
            columns: EMPLOYEE_TOGGLEABLE_COLUMNS.map(({ id, labelKey }) => ({
              id,
              label: t(`columns.${labelKey}`),
            })),
            visibility: columnVisibility,
            onVisibilityChange: (id, isVisible) =>
              setColumnVisibility((current) => ({ ...current, [id]: isVisible })),
          }}
        >
          {hasDepartmentFilter && (
            <label className="text-small text-secondary-foreground flex items-center gap-2">
              <Switch
                checked={list.filters.include_sub_departments === INCLUDE_SUB_DEPARTMENTS_ON}
                onCheckedChange={(isOn) =>
                  list.setFilter(
                    'include_sub_departments',
                    isOn ? INCLUDE_SUB_DEPARTMENTS_ON : null,
                  )
                }
              />
              {t('filters.includeSubDepartments')}
            </label>
          )}
        </DataTable.Toolbar>
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(employee) => String(employee.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          emptyState={
            <EmptyState
              icon={Users}
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
        <EmployeeFormDialog
          key={formTarget.employee?.id ?? 'new'}
          employee={formTarget.employee}
          onClose={() => setFormTarget(null)}
        />
      )}
      {statusTarget && (
        <EmployeeStatusDialog
          employee={statusTarget.employee}
          action={statusTarget.action}
          onClose={() => setStatusTarget(null)}
        />
      )}
      {offboardTarget && (
        <OffboardDialog employee={offboardTarget} onClose={() => setOffboardTarget(null)} />
      )}
    </>
  );
}
