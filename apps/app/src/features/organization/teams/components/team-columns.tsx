import { Button } from '@crm/ui';
import { Pencil, Trash2 } from 'lucide-react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { StatusBadge } from '@/shared/components/display/status-badge';

import type { Team } from '../types';
import { getTeamStatus } from '../utils/mappers';

const helper = createDataTableColumnHelper<Team>();
const EMPTY_CELL = '—';

interface TeamColumnsInput {
  t: (key: string) => string;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export function createTeamColumns({
  t,
  onEdit,
  onDelete,
}: TeamColumnsInput): DataTableColumn<Team>[] {
  return [
    ...helper.columns([
      helper.accessor('name', {
        id: 'name',
        header: t('columns.name'),
        cell: ({ getValue }) => <span className="text-foreground font-semibold">{getValue()}</span>,
      }),
      helper.accessor((team) => team.department?.name, {
        id: 'department',
        header: t('columns.department'),
        cell: ({ getValue }) => getValue() ?? EMPTY_CELL,
      }),
      helper.accessor((team) => team.leader?.name, {
        id: 'leader',
        header: t('columns.leader'),
        cell: ({ getValue }) => getValue() ?? EMPTY_CELL,
      }),
      helper.accessor('members_count', {
        id: 'members_count',
        header: t('columns.members'),
        cell: ({ getValue }) => <span className="num">{getValue() ?? EMPTY_CELL}</span>,
      }),
      helper.display({
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => <StatusBadge status={getTeamStatus(row.original)} />,
      }),
    ]),
    createActionsColumn<Team>((team) => (
      <Can permission={PERMISSIONS.teamsManage}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${t('actions.edit')}: ${team.name}`}
          onClick={() => onEdit(team)}
        >
          <Pencil aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${t('actions.delete')}: ${team.name}`}
          onClick={() => onDelete(team)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 aria-hidden />
        </Button>
      </Can>
    )),
  ];
}
