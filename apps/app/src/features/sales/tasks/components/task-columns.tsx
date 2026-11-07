import { Button, cn } from '@crm/ui';
import { CheckCircle2, Circle, Pencil, Trash2, UserRoundPen } from 'lucide-react';

import { PERMISSIONS } from '@/config/permissions';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type DataTableColumn,
} from '@/shared/components/data-table/types';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { useCan } from '@/shared/hooks/use-can';

import type { Task } from '../types';

const helper = createDataTableColumnHelper<Task>();

export interface TaskActions {
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onAssign: (task: Task) => void;
  onDelete: (task: Task) => void;
}

interface TaskColumnsInput {
  t: (key: string) => string;
  actions: TaskActions;
}

const PRIORITY_CLASSES: Record<Task['priority'], string> = {
  high: 'bg-destructive-soft text-destructive',
  normal: 'bg-info-soft text-info',
  low: 'border bg-muted text-muted-foreground',
};

function TaskToggle({ task, actions, label }: { task: Task; actions: TaskActions; label: string }) {
  const canUpdate = useCan(PERMISSIONS.tasksUpdate);
  const Icon = task.status === 'done' ? CheckCircle2 : Circle;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={!canUpdate}
      aria-label={label}
      aria-pressed={task.status === 'done'}
      onClick={() => actions.onToggle(task)}
    >
      <Icon
        className={cn(task.status === 'done' ? 'text-success' : 'text-text-faint')}
        aria-hidden
      />
    </Button>
  );
}

function TaskRowActions({
  task,
  actions,
  labels,
}: {
  task: Task;
  actions: TaskActions;
  labels: { edit: string; assign: string; delete: string };
}) {
  const canUpdate = useCan(PERMISSIONS.tasksUpdate);
  const canAssign = useCan(PERMISSIONS.tasksAssign);
  const canDelete = useCan(PERMISSIONS.tasksDelete);
  const editLabel = labels.edit;
  const deleteLabel = labels.delete;

  if (!canUpdate && !canAssign && !canDelete) return null;

  return (
    <div className="flex items-center gap-1">
      {canAssign && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${labels.assign}: ${task.title}`}
          onClick={() => actions.onAssign(task)}
        >
          <UserRoundPen aria-hidden />
        </Button>
      )}
      {canUpdate && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${editLabel}: ${task.title}`}
          onClick={() => actions.onEdit(task)}
        >
          <Pencil aria-hidden />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${deleteLabel}: ${task.title}`}
          onClick={() => actions.onDelete(task)}
        >
          <Trash2 aria-hidden />
        </Button>
      )}
    </div>
  );
}

export function createTaskColumns({ t, actions }: TaskColumnsInput): DataTableColumn<Task>[] {
  return [
    ...helper.columns([
      helper.display({
        id: 'done',
        header: '',
        cell: ({ row }) => (
          <TaskToggle
            task={row.original}
            actions={actions}
            label={row.original.status === 'done' ? t('actions.reopen') : t('actions.complete')}
          />
        ),
      }),
      helper.display({
        id: 'title',
        header: t('columns.task'),
        cell: ({ row }) => (
          <span
            className={cn(
              'block truncate font-semibold',
              row.original.status === 'done' && 'text-text-faint line-through',
            )}
          >
            {row.original.title}
          </span>
        ),
      }),
      helper.display({
        id: 'priority',
        header: t('columns.priority'),
        cell: ({ row }) => (
          <span
            className={cn(
              'text-caption inline-flex rounded-full px-2.5 py-0.5 font-medium',
              PRIORITY_CLASSES[row.original.priority],
            )}
          >
            {t(`filters.priorities.${row.original.priority}`)}
          </span>
        ),
      }),
      helper.display({
        id: 'due_at',
        header: t('columns.due'),
        cell: ({ row }) => (
          <span className={cn(row.original.is_overdue && 'text-destructive font-medium')}>
            <FormattedDate value={row.original.due_at} />
            {row.original.is_overdue && <> · {t('overdue')}</>}
          </span>
        ),
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
            <span className="text-text-faint">—</span>
          ),
      }),
    ]),
    createActionsColumn<Task>((task) => (
      <TaskRowActions
        task={task}
        actions={actions}
        labels={{
          edit: t('actions.edit'),
          assign: t('actions.assign'),
          delete: t('actions.delete'),
        }}
      />
    )),
  ];
}
