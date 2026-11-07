import { emptyToNull, idOrNull } from '@/lib/utils/strings';

import type { TaskFormValues } from '../schemas';
import type { Task } from '../types';

export const EMPTY_TASK_FORM: TaskFormValues = {
  title: '',
  description: '',
  priority: 'normal',
  due_at: '',
  owner_id: '',
};

export function toTaskFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    // The date picker holds the day only.
    due_at: task.due_at?.slice(0, 10) ?? '',
    owner_id: task.owner ? String(task.owner.id) : '',
  };
}

export interface TaskRelation {
  type: 'lead' | 'deal';
  id: number;
}

/**
 * The owner and relation are set only when a task is created: the API rejects `owner_id` on
 * update (reassigning goes through `POST /tasks/{id}/assign`) and never moves the relation.
 */
export function toTaskPayload(
  values: TaskFormValues,
  options: { isCreate: boolean; related?: TaskRelation },
) {
  const fields = {
    title: values.title.trim(),
    description: emptyToNull(values.description),
    priority: values.priority,
    due_at: values.due_at === '' ? null : `${values.due_at}T23:59:00`,
  };
  if (!options.isCreate) return fields;

  const related = options.related;
  return {
    ...(related ? { related_type: related.type, related_id: related.id } : {}),
    ...fields,
    owner_id: idOrNull(values.owner_id),
  };
}
