import { Link } from '@/lib/i18n/navigation';
import { createActionsColumn, createSelectionColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { Amount } from '@/shared/components/display/amount';
import { RelativeTime } from '@/shared/components/display/relative-time';
import { StageBadge } from '@/shared/components/display/stage-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';

import type { Lead } from '../types';
import { type LeadActions, LeadActionsMenu } from './lead-actions-menu';

const helper = createDataTableColumnHelper<Lead>();
const EMPTY_CELL = '—';

interface LeadColumnsInput {
  t: (key: string) => string;
  actions: LeadActions;
}

export function createLeadColumns({ t, actions }: LeadColumnsInput): DataTableColumn<Lead>[] {
  return [
    createSelectionColumn<Lead>(),
    ...helper.columns([
      helper.accessor('name', {
        id: 'name',
        header: t('columns.lead'),
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={`/leads/${row.original.id}`}
              className="text-foreground hover:text-primary block truncate font-semibold"
            >
              {row.original.name}
            </Link>
            {row.original.phone && (
              <bdi dir="ltr" className="num text-caption text-muted-foreground block">
                {row.original.phone}
              </bdi>
            )}
          </div>
        ),
      }),
      helper.display({
        id: 'stage',
        header: t('columns.stage'),
        cell: ({ row }) =>
          row.original.stage ? (
            <StageBadge name={row.original.stage.name} color={row.original.stage.color} />
          ) : (
            EMPTY_CELL
          ),
      }),
      helper.display({
        id: 'source',
        header: t('columns.source'),
        cell: ({ row }) => row.original.source?.name ?? EMPTY_CELL,
      }),
      helper.display({
        id: 'owner',
        header: t('columns.owner'),
        cell: ({ row }) =>
          row.original.owner ? (
            <div className="flex items-center gap-2">
              <UserAvatar id={row.original.owner.id} name={row.original.owner.name} size="sm" />
              <span className="truncate">{row.original.owner.name}</span>
            </div>
          ) : (
            <span className="text-text-faint">{t('unassigned')}</span>
          ),
      }),
      helper.accessor('budget', {
        id: 'budget',
        header: t('columns.budget'),
        cell: ({ getValue }) => <Amount value={getValue()} />,
      }),
      helper.accessor('last_activity_at', {
        id: 'last_activity_at',
        header: t('columns.lastActivity'),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            <RelativeTime value={getValue()} fallback={t('noActivity')} />
          </span>
        ),
      }),
    ]),
    createActionsColumn<Lead>((lead) => <LeadActionsMenu lead={lead} actions={actions} />),
  ];
}
