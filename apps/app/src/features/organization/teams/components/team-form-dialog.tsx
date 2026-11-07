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

import { useDepartmentOptions } from '@/features/organization/departments';
import { useEmployeeOptions } from '@/features/organization/employees';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { SwitchField } from '@/shared/components/form/switch-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveTeam } from '../hooks/use-team-mutations';
import { teamFormSchema, type TeamFormValues } from '../schemas';
import type { Team } from '../types';
import { EMPTY_TEAM_FORM, toTeamFormValues } from '../utils/mappers';

const TEAM_FIELDS = Object.keys(EMPTY_TEAM_FORM);

interface TeamFormDialogProps {
  /** The team being edited, or null to create one. */
  team: Team | null;
  onClose: () => void;
}

/** Mount only while open (key by team): a fresh mount is a fresh form, so no reset effects. */
export function TeamFormDialog({ team, onClose }: TeamFormDialogProps) {
  const t = useTranslations('teams');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveTeam();
  const departments = useDepartmentOptions();

  const { control, handleSubmit, setError } = useZodForm(
    teamFormSchema,
    team ? toTeamFormValues(team) : EMPTY_TEAM_FORM,
  );

  const submit = (values: TeamFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: team?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, TEAM_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{team ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name_ar" label={t('fields.nameAr')} isRequired />
            <TextField control={control} name="name_en" label={t('fields.nameEn')} isLtr />
            <SelectField
              control={control}
              name="department_id"
              label={t('fields.department')}
              options={departments.options}
              placeholder={t('fields.departmentPlaceholder')}
              isRequired
            />
            <AsyncSelectField
              control={control}
              name="leader_id"
              label={t('fields.leader')}
              useOptions={useEmployeeOptions}
              initialOption={
                team?.leader ? { value: String(team.leader.id), label: team.leader.name } : null
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
