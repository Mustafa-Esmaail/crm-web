import { Link } from '@/lib/i18n/navigation';
import { createActionsColumn, createSelectionColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { RelativeTime } from '@/shared/components/display/relative-time';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';

import type { Employee } from '../types';
import { type EmployeeActions, EmployeeActionsMenu } from './employee-actions-menu';

const helper = createDataTableColumnHelper<Employee>();
const EMPTY_CELL = '—';

interface EmployeeColumnsInput {
  t: (key: string) => string;
  actions: EmployeeActions;
}

export function createEmployeeColumns({
  t,
  actions,
}: EmployeeColumnsInput): DataTableColumn<Employee>[] {
  return [
    createSelectionColumn<Employee>(),
    ...helper.columns([
      helper.accessor('name', {
        id: 'name',
        header: t('columns.employee'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar id={row.original.id} name={row.original.name} size="md" />
            <div className="min-w-0">
              <Link
                href={`/organization/employees/${row.original.id}`}
                className="text-foreground hover:text-primary block truncate font-semibold"
              >
                {row.original.name}
              </Link>
              {row.original.job_title && (
                <p className="text-caption text-muted-foreground truncate">
                  {row.original.job_title}
                </p>
              )}
            </div>
          </div>
        ),
      }),
      helper.accessor('employee_code', {
        id: 'code',
        header: t('columns.code'),
        cell: ({ getValue }) => (
          <span className="num" dir="ltr">
            {getValue() ?? EMPTY_CELL}
          </span>
        ),
      }),
      helper.accessor((employee) => employee.department?.name, {
        id: 'department',
        header: t('columns.department'),
        cell: ({ getValue }) => getValue() ?? EMPTY_CELL,
      }),
      helper.accessor((employee) => employee.team?.name, {
        id: 'team',
        header: t('columns.team'),
        cell: ({ getValue }) => {
          const team = getValue();
          return team ? (
            <span className="text-caption text-secondary-foreground bg-card rounded-md border px-2 py-0.5">
              {team}
            </span>
          ) : (
            EMPTY_CELL
          );
        },
      }),
      helper.accessor((employee) => employee.branch?.name, {
        id: 'branch',
        header: t('columns.branch'),
        cell: ({ getValue }) => getValue() ?? EMPTY_CELL,
      }),
      helper.display({
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      }),
      helper.accessor('last_login_at', {
        id: 'last_login',
        header: t('columns.lastLogin'),
        cell: ({ getValue }) => <RelativeTime value={getValue()} fallback={t('never')} />,
      }),
    ]),
    createActionsColumn<Employee>((employee) => (
      <EmployeeActionsMenu employee={employee} actions={actions} />
    )),
  ];
}
