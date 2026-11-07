import { Button, cn } from '@crm/ui';
import { Pencil, SlidersHorizontal, Trash2 } from 'lucide-react';

import { PERMISSIONS } from '@/config/permissions';
import { Link } from '@/lib/i18n/navigation';
import { Can } from '@/shared/components/auth/can';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { CodeLabel } from '@/shared/components/display/code-label';

import type { Role } from '../types';

const helper = createDataTableColumnHelper<Role>();
const EMPTY_CELL = '—';

interface RoleColumnsInput {
  t: (key: string) => string;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function createRoleColumns({
  t,
  onEdit,
  onDelete,
}: RoleColumnsInput): DataTableColumn<Role>[] {
  return [
    ...helper.columns([
      helper.accessor('name', {
        id: 'name',
        header: t('columns.name'),
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={`/access/roles/${row.original.id}`}
              className="text-foreground hover:text-primary block truncate font-semibold"
            >
              {row.original.name}
            </Link>
            <CodeLabel>{row.original.key}</CodeLabel>
          </div>
        ),
      }),
      helper.accessor('description', {
        id: 'description',
        header: t('columns.description'),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground line-clamp-2">{getValue() ?? EMPTY_CELL}</span>
        ),
      }),
      helper.accessor('employees_count', {
        id: 'employees_count',
        header: t('columns.employees'),
        cell: ({ getValue }) => <span className="num">{getValue() ?? EMPTY_CELL}</span>,
      }),
      helper.accessor('is_system', {
        id: 'type',
        header: t('columns.type'),
        cell: ({ getValue }) => (
          <span
            className={cn(
              'text-caption inline-flex rounded-full px-2.5 py-0.5 font-semibold',
              getValue() ? 'bg-info-soft text-info' : 'bg-muted text-muted-foreground',
            )}
          >
            {getValue() ? t('type.system') : t('type.custom')}
          </span>
        ),
      }),
    ]),
    createActionsColumn<Role>((role) => (
      <>
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          aria-label={`${t('actions.permissions')}: ${role.name}`}
        >
          <Link href={`/access/roles/${role.id}`}>
            <SlidersHorizontal aria-hidden />
          </Link>
        </Button>
        <Can permission={PERMISSIONS.rolesManage}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${t('actions.edit')}: ${role.name}`}
            onClick={() => onEdit(role)}
          >
            <Pencil aria-hidden />
          </Button>
          {!role.is_system && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${t('actions.delete')}: ${role.name}`}
              onClick={() => onDelete(role)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 aria-hidden />
            </Button>
          )}
        </Can>
      </>
    )),
  ];
}
