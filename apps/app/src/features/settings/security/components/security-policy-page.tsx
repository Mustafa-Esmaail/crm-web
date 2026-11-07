'use client';

import { isApiError } from '@crm/api-client';
import { Button, Card, Checkbox, Input, Label, Textarea } from '@crm/ui';
import { Info, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { type Control, Controller, useWatch } from 'react-hook-form';

import { PERMISSIONS } from '@/config/permissions';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { NoPermission } from '@/shared/components/feedback/no-permission';
import { PageSkeleton } from '@/shared/components/feedback/page-skeleton';
import { FormAlert } from '@/shared/components/form/form-alert';
import { FormField, SERVER_ERROR_TYPE } from '@/shared/components/form/form-field';
import { SwitchField } from '@/shared/components/form/switch-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';
import { useCurrentUser } from '@/shared/hooks/use-current-user';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import { useSaveSecurityPolicy, useSecurityPolicyQuery } from '../hooks/use-security-policy';
import { securityFormSchema, type SecurityFormValues } from '../schemas';
import { type SecurityPolicy, WEEK_DAYS } from '../types';
import { mapSecurityErrors, parseIpList, toSecurityFormValues } from '../utils/mappers';

export function SecurityPolicyPage() {
  const t = useTranslations('securityPolicy');
  const tNav = useTranslations('nav');
  const canManage = useCan(PERMISSIONS.securityManage);
  const query = useSecurityPolicyQuery(canManage);

  const header = (
    <PageHeader>
      <PageHeader.Heading>
        <PageHeader.Breadcrumbs
          items={[
            { label: tNav('items.home'), href: '/' },
            { label: tNav('sections.admin') },
            { label: t('title') },
          ]}
        />
        <PageHeader.Title>{t('title')}</PageHeader.Title>
        <PageHeader.Description>{t('description')}</PageHeader.Description>
      </PageHeader.Heading>
    </PageHeader>
  );

  let body;
  if (!canManage) body = <NoPermission />;
  else if (query.error)
    body = <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  else if (!query.data) body = <PageSkeleton />;
  // Keyed by the saved time so a save (or a change elsewhere) resets the form to what is stored.
  else body = <SecurityPolicyForm key={query.data.updated_at ?? 'new'} policy={query.data} />;

  return (
    <>
      {header}
      {body}
    </>
  );
}

function SecurityPolicyForm({ policy }: { policy: SecurityPolicy }) {
  const t = useTranslations('securityPolicy');
  const tCommon = useTranslations('common');
  const { user } = useCurrentUser();
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveSecurityPolicy();
  const toastUnexpected = useToastUnexpectedError();

  const { control, handleSubmit, setError, reset, formState } = useZodForm(
    securityFormSchema,
    toSecurityFormValues(policy),
  );
  const hoursEnabled = useWatch({ control, name: 'hours_enabled' });

  const submit = (values: SecurityFormValues) => {
    setAlertMessages([]);
    save.mutate(values, {
      onError: (error) => {
        toastUnexpected(error);
        if (!isApiError(error) || error.status !== 422) return;
        const mapped = mapSecurityErrors(error.fieldErrors, parseIpList(values.ip_whitelist));
        for (const [field, message] of Object.entries(mapped.fields)) {
          setError(field as keyof SecurityFormValues, { type: SERVER_ERROR_TYPE, message });
        }
        setAlertMessages(
          mapped.unmapped.length > 0 || Object.keys(mapped.fields).length > 0
            ? mapped.unmapped
            : [error.message],
        );
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="bg-info-soft text-small text-info flex items-start gap-2 rounded-md px-3 py-2">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>{user?.is_owner ? t('ownerNoteSelf') : t('ownerNote')}</p>
      </div>
      <FormAlert messages={alertMessages} />

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-semibold">{t('sections.network.title')}</h2>
          <p className="text-small text-muted-foreground">{t('sections.network.description')}</p>
        </div>
        <FormField
          control={control}
          name="ip_whitelist"
          label={t('fields.ipWhitelist')}
          description={t('fields.ipWhitelistHint')}
        >
          {({ field, id, isInvalid, describedBy }) => (
            <Textarea
              {...field}
              value={String(field.value ?? '')}
              id={id}
              rows={4}
              dir="ltr"
              placeholder={'41.33.10.0/24\n10.0.0.5'}
              aria-invalid={isInvalid}
              aria-describedby={describedBy}
              className="bg-muted num min-h-24 text-start"
            />
          )}
        </FormField>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-semibold">{t('sections.hours.title')}</h2>
          <p className="text-small text-muted-foreground">{t('sections.hours.description')}</p>
        </div>
        <SwitchField control={control} name="hours_enabled" label={t('fields.hoursEnabled')} />
        {hoursEnabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TimeField control={control} name="hours_from" label={t('fields.from')} />
              <TimeField control={control} name="hours_to" label={t('fields.to')} />
            </div>
            <p className="text-caption text-muted-foreground">{t('fields.overnightHint')}</p>
            <DaysField control={control} />
          </>
        )}
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-semibold">{t('sections.access.title')}</h2>
          <p className="text-small text-muted-foreground">{t('sections.access.description')}</p>
        </div>
        {/* This app has no two-factor sign-in yet, so switching this on would lock every
            employee but the owner out. It can still be switched off if it was set elsewhere. */}
        <SwitchField
          control={control}
          name="require_two_factor"
          label={t('fields.requireTwoFactor')}
          description={t('fields.requireTwoFactorUnavailable')}
          disabled={!policy.require_two_factor}
        />
        <SwitchField
          control={control}
          name="export_requires_approval"
          label={t('fields.exportApproval')}
          description={t('fields.exportApprovalHint')}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!formState.isDirty || save.isPending}
          onClick={() => {
            setAlertMessages([]);
            reset();
          }}
        >
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={!formState.isDirty || save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {tCommon('save')}
        </Button>
      </div>
    </form>
  );
}

interface TimeFieldProps {
  control: Control<SecurityFormValues>;
  name: 'hours_from' | 'hours_to';
  label: string;
}

function TimeField({ control, name, label }: TimeFieldProps) {
  return (
    <FormField control={control} name={name} label={label} isRequired>
      {({ field, id, isInvalid, describedBy }) => (
        <Input
          {...field}
          id={id}
          type="time"
          dir="ltr"
          value={String(field.value ?? '')}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          className="num ltr-field"
        />
      )}
    </FormField>
  );
}

function DaysField({ control }: Pick<TimeFieldProps, 'control'>) {
  const t = useTranslations('securityPolicy');

  return (
    <Controller
      control={control}
      name="hours_days"
      render={({ field, fieldState }) => {
        const selected = new Set(field.value);
        const toggle = (day: number, checked: boolean) => {
          const next = new Set(selected);
          if (checked) next.add(day);
          else next.delete(day);
          field.onChange([...next].sort((a, b) => a - b));
        };
        const message = fieldState.error?.message;

        return (
          <fieldset className="space-y-2">
            <legend className="text-small font-medium">{t('fields.days')}</legend>
            <p className="text-caption text-muted-foreground">{t('fields.daysHint')}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {WEEK_DAYS.map((day) => (
                <Label key={day} className="flex items-center gap-2 font-normal">
                  <Checkbox
                    checked={selected.has(day)}
                    onCheckedChange={(checked) => toggle(day, checked === true)}
                  />
                  {t(`days.${day}`)}
                </Label>
              ))}
            </div>
            {message && (
              <p role="alert" className="text-caption text-destructive">
                {fieldState.error?.type === SERVER_ERROR_TYPE ? message : t(message)}
              </p>
            )}
          </fieldset>
        );
      }}
    />
  );
}
