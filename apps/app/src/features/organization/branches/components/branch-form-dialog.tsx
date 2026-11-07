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
import { useState } from 'react';

import { useEmployeeOptions } from '@/features/organization/employees';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SwitchField } from '@/shared/components/form/switch-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveBranch } from '../hooks/use-branch-mutations';
import { branchFormSchema, type BranchFormValues } from '../schemas';
import type { Branch } from '../types';
import { EMPTY_BRANCH_FORM, toBranchFormValues } from '../utils/mappers';

const BRANCH_FIELDS = Object.keys(EMPTY_BRANCH_FORM);

interface BranchFormDialogProps {
  /** The branch being edited, or null to create a new one. */
  branch: Branch | null;
  onClose: () => void;
}

/** Mount it only while open (key it by branch): a fresh mount is a fresh form, no reset effects. */
export function BranchFormDialog({ branch, onClose }: BranchFormDialogProps) {
  const t = useTranslations('branches');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveBranch();

  const { control, handleSubmit, setError } = useZodForm(
    branchFormSchema,
    branch ? toBranchFormValues(branch) : EMPTY_BRANCH_FORM,
  );

  const submit = (values: BranchFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: branch?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, BRANCH_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{branch ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} isLtr />
            <TextField control={control} name="code" label={t('fields.code')} isLtr />
            <TextField control={control} name="city" label={t('fields.city')} />
            <TextField control={control} name="phone" label={t('fields.phone')} type="tel" isLtr />
            <AsyncSelectField
              control={control}
              name="manager_id"
              label={t('fields.manager')}
              useOptions={useEmployeeOptions}
              initialOption={
                branch?.manager
                  ? { value: String(branch.manager.id), label: branch.manager.name }
                  : null
              }
            />
          </div>
          <TextField control={control} name="address" label={t('fields.address')} />
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
