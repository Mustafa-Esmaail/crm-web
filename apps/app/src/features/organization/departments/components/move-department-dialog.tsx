'use client';

import { isApiError } from '@crm/api-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@crm/ui';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useMoveDepartment } from '../hooks/use-department-mutations';
import { useDepartmentTreeQuery } from '../hooks/use-departments-queries';
import { moveDepartmentSchema, type MoveDepartmentValues } from '../schemas';
import type { Department } from '../types';
import { getParentOptions } from '../utils/mappers';

interface MoveDepartmentDialogProps {
  department: Department;
  onClose: () => void;
}

export function MoveDepartmentDialog({ department, onClose }: MoveDepartmentDialogProps) {
  const t = useTranslations('departments.move');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const move = useMoveDepartment();
  const tree = useDepartmentTreeQuery();

  // The department and its own sub-departments are excluded: the API refuses a cycle anyway.
  const options = useMemo(
    () => getParentOptions(tree.data ?? [], department.id),
    [tree.data, department.id],
  );

  const { control, handleSubmit, setError } = useZodForm(moveDepartmentSchema, {
    parent_id: department.parent_id === null ? '' : String(department.parent_id),
  });

  const submit = (values: MoveDepartmentValues) => {
    setAlertMessages([]);
    move.mutate(
      { id: department.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, ['parent_id']).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !move.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title', { name: department.name })}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <SelectField
            control={control}
            name="parent_id"
            label={t('newParent')}
            options={options}
            noneLabel={t('root')}
            placeholder={t('root')}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={move.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={move.isPending}>
              {move.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
