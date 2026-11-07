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
import { useWatch } from 'react-hook-form';

import { useTeamLookup } from '@/features/organization/teams';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { SwitchField } from '@/shared/components/form/switch-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveChannel } from '../hooks/use-channels';
import { channelFormSchema, type ChannelFormValues } from '../schemas';
import { type Channel, CHANNEL_TYPES, CREDENTIAL_FIELDS } from '../types';
import { EMPTY_CHANNEL_FORM, toChannelFormValues } from '../utils/mappers';

const CHANNEL_FIELDS = Object.keys(EMPTY_CHANNEL_FORM);

interface ChannelFormDialogProps {
  /** The connection being edited, or null to create one. Mount only while open. */
  channel: Channel | null;
  onClose: () => void;
}

export function ChannelFormDialog({ channel, onClose }: ChannelFormDialogProps) {
  const t = useTranslations('channels');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveChannel();
  const teams = useTeamLookup();

  const { control, handleSubmit, setError } = useZodForm(
    channelFormSchema,
    channel ? toChannelFormValues(channel) : EMPTY_CHANNEL_FORM,
  );
  const type = useWatch({ control, name: 'type' });

  const submit = (values: ChannelFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: channel?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, CHANNEL_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{channel ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              control={control}
              name="type"
              label={t('fields.type')}
              disabled={channel !== null}
              options={CHANNEL_TYPES.map((value) => ({ value, label: t(`types.${value}`) }))}
            />
            <TextField control={control} name="name" label={t('fields.name')} isRequired />
            <SelectField
              control={control}
              name="team_id"
              label={t('fields.team')}
              noneLabel={t('fields.noTeam')}
              options={teams.options}
            />
            <TextField
              control={control}
              name="lead_source_key"
              label={t('fields.sourceKey')}
              description={t('fields.sourceKeyHint')}
              isLtr
            />
          </div>

          <fieldset className="space-y-3 rounded-md border p-4">
            <legend className="text-small px-1 font-medium">{t('credentials.title')}</legend>
            <p className="text-caption text-muted-foreground">
              {channel ? t('credentials.keepHint') : t('credentials.hint')}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {CREDENTIAL_FIELDS[type].map((field) => (
                <TextField
                  key={`${type}-${field.key}`}
                  control={control}
                  name={`credentials.${field.key}`}
                  label={t(`credentials.fields.${field.key}`)}
                  type="password"
                  autoComplete="off"
                  isLtr
                  isRequired={field.required && !channel}
                  description={
                    channel?.credentials_set.includes(field.key)
                      ? t('credentials.isSet')
                      : undefined
                  }
                />
              ))}
            </div>
          </fieldset>

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
