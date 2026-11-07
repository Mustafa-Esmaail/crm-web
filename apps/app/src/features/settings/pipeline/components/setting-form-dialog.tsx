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
import { NumberField } from '@/shared/components/form/number-field';
import { SwitchField } from '@/shared/components/form/switch-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveSetting } from '../hooks/use-pipeline';
import { settingFormSchema, type SettingFormValues } from '../schemas';
import { type Setting, type SettingKind, STAGE_KINDS } from '../types';
import { EMPTY_SETTING_FORM, toSettingFormValues } from '../utils/mappers';

const SETTING_FIELDS = Object.keys(EMPTY_SETTING_FORM);

interface SettingFormDialogProps {
  kind: SettingKind;
  /** The record being edited, or null to create one. Mount only while open. */
  setting: Setting | null;
  onClose: () => void;
}

export function SettingFormDialog({ kind, setting, onClose }: SettingFormDialogProps) {
  const t = useTranslations('pipelineSettings');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveSetting(kind);
  const isStage = STAGE_KINDS.includes(kind);

  const { control, handleSubmit, setError } = useZodForm(
    settingFormSchema,
    setting ? toSettingFormValues(setting) : EMPTY_SETTING_FORM,
  );

  const submit = (values: SettingFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: setting?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, SETTING_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(`kinds.${kind}.${setting ? 'edit' : 'create'}`)}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} />
            {!setting && (
              <TextField
                control={control}
                name="key"
                label={t('fields.key')}
                description={t('fields.keyHint')}
              />
            )}
            {isStage && (
              <>
                <NumberField control={control} name="position" label={t('fields.position')} />
                <TextField
                  control={control}
                  name="color"
                  label={t('fields.color')}
                  description={t('fields.colorHint')}
                />
              </>
            )}
          </div>
          {isStage ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SwitchField control={control} name="is_won" label={t('fields.isWon')} />
              <SwitchField control={control} name="is_lost" label={t('fields.isLost')} />
            </div>
          ) : (
            <SwitchField control={control} name="is_active" label={t('fields.isActive')} />
          )}

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
