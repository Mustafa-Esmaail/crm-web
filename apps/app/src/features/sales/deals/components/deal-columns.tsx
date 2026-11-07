import { Link } from '@/lib/i18n/navigation';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { Amount } from '@/shared/components/display/amount';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StageBadge } from '@/shared/components/display/stage-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';

import type { Deal } from '../types';
import { type DealActions, DealActionsMenu } from './deal-actions-menu';

const helper = createDataTableColumnHelper<Deal>();
const EMPTY_CELL = '—';

interface DealColumnsInput {
  t: (key: string) => string;
  actions: DealActions;
}

export function createDealColumns({ t, actions }: DealColumnsInput): DataTableColumn<Deal>[] {
  return [
    ...helper.columns([
      helper.accessor('title', {
        id: 'title',
        header: t('columns.deal'),
        cell: ({ row, getValue }) => (
          <Link
            href={`/deals/${row.original.id}`}
            className="text-foreground block truncate font-semibold hover:underline"
          >
            {getValue()}
          </Link>
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
      helper.accessor('value', {
        id: 'value',
        header: t('columns.value'),
        cell: ({ getValue }) => <Amount value={getValue()} />,
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
      helper.accessor('expected_close_date', {
        id: 'expected_close_date',
        header: t('columns.expectedClose'),
        cell: ({ getValue }) => <FormattedDate value={getValue()} />,
      }),
    ]),
    createActionsColumn<Deal>((deal) => <DealActionsMenu deal={deal} actions={actions} />),
  ];
}
