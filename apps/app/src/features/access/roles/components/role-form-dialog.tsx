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

import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { TextField } from '@/shared/components/form/text-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveRole } from '../hooks/use-role-mutations';
import { roleFormSchema, type RoleFormValues } from '../schemas';
import type { Role } from '../types';
import { EMPTY_ROLE_FORM, toRoleFormValues } from '../utils/mappers';

const ROLE_FIELDS = Object.keys(EMPTY_ROLE_FORM);

interface RoleFormDialogProps {
  /** The role being edited, or null to create a new one. */
  role: Role | null;
  onClose: () => void;
}

/** Mount it only while open (key it by role): a fresh mount is a fresh form, no reset effects. */
export function RoleFormDialog({ role, onClose }: RoleFormDialogProps) {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveRole();

  const { control, handleSubmit, setError } = useZodForm(
    roleFormSchema,
    role ? toRoleFormValues(role) : EMPTY_ROLE_FORM,
  );

  const submit = (values: RoleFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: role?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, ROLE_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{role ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} isLtr />
          </div>
          <TextField
            control={control}
            name="key"
            label={t('fields.key')}
            description={t('fields.keyHint')}
            isLtr
            disabled={role?.is_system}
          />
          <TextareaField control={control} name="description" label={t('fields.description')} />

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
