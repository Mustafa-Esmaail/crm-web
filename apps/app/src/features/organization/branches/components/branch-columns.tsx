import { Button } from '@crm/ui';
import { Pencil, Trash2 } from 'lucide-react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { CodeLabel } from '@/shared/components/display/code-label';
import { StatusBadge } from '@/shared/components/display/status-badge';

import type { Branch } from '../types';
import { getBranchStatus } from '../utils/mappers';

const helper = createDataTableColumnHelper<Branch>();

interface BranchColumnsInput {
  t: (key: string) => string;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}

const EMPTY_CELL = '—';

/** Factory: columns depend on translations and callbacks, so they are built, not hard-coded. */
export function createBranchColumns({
  t,
  onEdit,
  onDelete,
}: BranchColumnsInput): DataTableColumn<Branch>[] {
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
      helper.accessor('city', {
        id: 'city',
        header: t('columns.city'),
        cell: ({ getValue }) => getValue() ?? EMPTY_CELL,
      }),
      helper.accessor('phone', {
        id: 'phone',
        header: t('columns.phone'),
        cell: ({ getValue }) => (
          <span className="num" dir="ltr">
            {getValue() ?? EMPTY_CELL}
          </span>
        ),
      }),
      helper.accessor((branch) => branch.manager?.name, {
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
        cell: ({ row }) => <StatusBadge status={getBranchStatus(row.original)} />,
      }),
    ]),
    createActionsColumn<Branch>((branch) => (
      <Can permission={PERMISSIONS.branchesManage}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${t('actions.edit')}: ${branch.name}`}
          onClick={() => onEdit(branch)}
        >
          <Pencil aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${t('actions.delete')}: ${branch.name}`}
          onClick={() => onDelete(branch)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 aria-hidden />
        </Button>
      </Can>
    )),
  ];
}
