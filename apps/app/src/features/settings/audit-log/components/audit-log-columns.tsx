import { Button } from '@crm/ui';
import { Eye } from 'lucide-react';

import type { AuditLog } from '@/features/audit';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { FormattedDate } from '@/shared/components/display/formatted-date';

import { AuditActionBadge } from './audit-action-badge';

const helper = createDataTableColumnHelper<AuditLog>();
const EMPTY_CELL = '—';

interface AuditLogColumnsInput {
  t: (key: string) => string;
  getModuleLabel: (module: string) => string;
  onView: (log: AuditLog) => void;
}

export function createAuditLogColumns({
  t,
  getModuleLabel,
  onView,
}: AuditLogColumnsInput): DataTableColumn<AuditLog>[] {
  return [
    ...helper.columns([
      helper.accessor('created_at', {
        id: 'created_at',
        header: t('columns.when'),
        cell: ({ getValue }) => (
          <bdi dir="ltr" className="num whitespace-nowrap">
            <FormattedDate value={getValue()} pattern="yyyy-MM-dd HH:mm" />
          </bdi>
        ),
      }),
      helper.accessor((log) => log.user?.name, {
        id: 'user',
        header: t('columns.user'),
        cell: ({ getValue }) => (
          <span className="text-foreground font-semibold">{getValue() ?? EMPTY_CELL}</span>
        ),
      }),
      helper.accessor('action', {
        id: 'action',
        header: t('columns.action'),
        cell: ({ getValue }) => <AuditActionBadge action={getValue()} />,
      }),
      helper.accessor('module', {
        id: 'module',
        header: t('columns.module'),
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? getModuleLabel(value) : EMPTY_CELL;
        },
      }),
      helper.accessor((log) => log.auditable_type, {
        id: 'record',
        header: t('columns.record'),
        cell: ({ row }) =>
          row.original.auditable_type ? (
            <span className="num">
              {row.original.auditable_type}
              {row.original.auditable_id ? ` #${row.original.auditable_id}` : ''}
            </span>
          ) : (
            EMPTY_CELL
          ),
      }),
    ]),
    createActionsColumn<AuditLog>((log) => (
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('actions.view')}
        onClick={() => onView(log)}
      >
        <Eye className="size-4" aria-hidden />
      </Button>
    )),
  ];
}
