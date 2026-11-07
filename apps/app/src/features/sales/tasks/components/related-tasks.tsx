'use client';

import { Button, Card, cn, Skeleton } from '@crm/ui';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { useCan } from '@/shared/hooks/use-can';

import { useToggleTask } from '../hooks/use-task-mutations';
import { useTasksQuery } from '../hooks/use-task-queries';
import type { TaskRelation } from '../utils/mappers';
import { TaskFormDialog } from './task-form-dialog';

const MAX_TASKS = 50;

/** Tasks attached to one lead or deal, with a quick way to add and tick them off. */
export function RelatedTasks({ relation }: { relation: TaskRelation }) {
  const t = useTranslations('tasks');
  const canView = useCan(PERMISSIONS.tasksView);
  const canUpdate = useCan(PERMISSIONS.tasksUpdate);
  const [creating, setCreating] = useState(false);
  const toggle = useToggleTask();
  const query = useTasksQuery({
    search: '',
    page: 1,
    perPage: MAX_TASKS,
    relatedType: relation.type,
    relatedId: relation.id,
  });

  if (!canView) return null;
  const tasks = query.data?.data ?? [];

  return (
    <Card className="gap-0 py-4">
      <div className="flex items-center justify-between gap-3 px-5 pb-3">
        <h2 className="text-card-title font-semibold">{t('related.title')}</h2>
        <Can permission={PERMISSIONS.tasksCreate}>
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            <Plus aria-hidden />
            {t('actions.create')}
          </Button>
        </Can>
      </div>

      {query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="px-5">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-small text-muted-foreground px-5">{t('related.empty')}</p>
      ) : (
        <ul className="divide-y border-t">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 px-5 py-2.5">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!canUpdate || toggle.isPending}
                aria-pressed={task.status === 'done'}
                aria-label={task.status === 'done' ? t('actions.reopen') : t('actions.complete')}
                onClick={() => toggle.mutate({ id: task.id, done: task.status !== 'done' })}
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="text-success" aria-hidden />
                ) : (
                  <Circle className="text-text-faint" aria-hidden />
                )}
              </Button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-small truncate font-medium',
                    task.status === 'done' && 'text-text-faint line-through',
                  )}
                >
                  {task.title}
                </p>
                <p
                  className={cn(
                    'text-caption text-text-faint',
                    task.is_overdue && 'text-destructive',
                  )}
                >
                  <FormattedDate value={task.due_at} />
                  {task.owner ? ` · ${task.owner.name}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <TaskFormDialog task={null} related={relation} onClose={() => setCreating(false)} />
      )}
    </Card>
  );
}
