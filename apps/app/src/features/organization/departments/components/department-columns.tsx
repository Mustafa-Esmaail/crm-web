import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { CodeLabel } from '@/shared/components/display/code-label';
import { StatusBadge } from '@/shared/components/display/status-badge';

import type { Department } from '../types';
import { getDepartmentStatus } from '../utils/mappers';
import { type DepartmentActions, DepartmentActionsMenu } from './department-actions-menu';

const helper = createDataTableColumnHelper<Department>();
const EMPTY_CELL = '—';

interface DepartmentColumnsInput {
  t: (key: string) => string;
  actions: DepartmentActions;
}

export function createDepartmentColumns({
  t,
  actions,
}: DepartmentColumnsInput): DataTableColumn<Department>[] {
  return [
    ...helper.columns([
      helper.accessor('name', {
        id: 'name',
        header: t('columns.name'),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="text-foreground truncate font-semibold">{row.original.name}</p>
            {row.original.code && <CodeLabel>{row.original.code}</CodeLabel>}
          </div>
        ),
      }),
      helper.accessor((department) => department.branch?.name, {
        id: 'branch',
        header: t('columns.branch'),
        cell: ({ getValue }) => getValue() ?? EMPTY_CELL,
      }),
      helper.accessor((department) => department.manager?.name, {
        id: 'manager',
        header: t('columns.manager'),
        cell: ({ getValue }) => getValue() ?? EMPTY_CELL,
      }),
      helper.accessor('employees_count', {
        id: 'employees_count',
        header: t('columns.employees'),
        cell: ({ getValue }) => <span className="num">{getValue() ?? EMPTY_CELL}</span>,
      }),
      helper.display({
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => <StatusBadge status={getDepartmentStatus(row.original)} />,
      }),
    ]),
    createActionsColumn<Department>((department) => (
      <DepartmentActionsMenu department={department} actions={actions} />
    )),
  ];
}
