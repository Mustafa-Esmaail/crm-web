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

import { useBranchOptions } from '@/features/organization/branches';
import { useEmployeeOptions } from '@/features/organization/employees';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { SwitchField } from '@/shared/components/form/switch-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveDepartment } from '../hooks/use-department-mutations';
import { useDepartmentTreeQuery } from '../hooks/use-departments-queries';
import { departmentFormSchema, type DepartmentFormValues } from '../schemas';
import type { Department } from '../types';
import { EMPTY_DEPARTMENT_FORM, getParentOptions, toDepartmentFormValues } from '../utils/mappers';

const DEPARTMENT_FIELDS = Object.keys(EMPTY_DEPARTMENT_FORM);

interface DepartmentFormDialogProps {
  /** The department being edited, or null to create one. */
  department: Department | null;
  /** Pre-selected parent when creating a sub-department. */
  parentId?: number | null;
  onClose: () => void;
}

/** Mount only while open (key by target): a fresh mount is a fresh form, so no reset effects. */
export function DepartmentFormDialog({
  department,
  parentId = null,
  onClose,
}: DepartmentFormDialogProps) {
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveDepartment();
  const tree = useDepartmentTreeQuery();
  const branches = useBranchOptions();

  const parentOptions = useMemo(
    () => getParentOptions(tree.data ?? [], department?.id),
    [tree.data, department?.id],
  );

  const { control, handleSubmit, setError } = useZodForm(
    departmentFormSchema,
    department
      ? toDepartmentFormValues(department)
      : { ...EMPTY_DEPARTMENT_FORM, parent_id: parentId === null ? '' : String(parentId) },
  );

  const submit = (values: DepartmentFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: department?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, DEPARTMENT_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{department ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} isLtr />
            <TextField control={control} name="code" label={t('fields.code')} isLtr />
            <SelectField
              control={control}
              name="parent_id"
              label={t('fields.parent')}
              options={parentOptions}
              noneLabel={t('fields.noParent')}
              placeholder={t('fields.noParent')}
            />
            <SelectField
              control={control}
              name="branch_id"
              label={t('fields.branch')}
              options={branches.options}
              noneLabel={t('fields.noBranch')}
              placeholder={t('fields.noBranch')}
            />
            <AsyncSelectField
              control={control}
              name="manager_id"
              label={t('fields.manager')}
              useOptions={useEmployeeOptions}
              initialOption={
                department?.manager
                  ? { value: String(department.manager.id), label: department.manager.name }
                  : null
              }
            />
          </div>
          <SwitchField control={control} name="is_active" label={t('fields.isActive')} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
