'use client';

import { isApiError } from '@crm/api-client';
import { Button } from '@crm/ui';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Loader2, Phone, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';
import { useHttpClient } from '@/shared/hooks/use-http-client';

import { ATTRIBUTION_KEYS, type DemoLeadBody, postDemoLead } from '../api/demo-requests';
import { DEMO_PHONE_COUNTRIES, demoLeadSchema, type DemoLeadValues } from '../schemas';

const LEAD_FIELDS = ['name', 'phone_country', 'phone'];

/** Campaign parameters and the page the visitor is on, so the lead keeps its source. */
function readAttribution(): Omit<DemoLeadBody, 'name' | 'phone_country' | 'phone'> {
  const params = new URLSearchParams(window.location.search);
  const attribution: Omit<DemoLeadBody, 'name' | 'phone_country' | 'phone'> = {
    landing_url: window.location.href,
    referrer: document.referrer || undefined,
  };
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }
  return attribution;
}

type DemoLeadFormProps = {
  /** Called once the API took the lead (or logged its failure); the demo opens. */
  onDone: () => void;
};

/** Asked once before the demo opens: name and mobile number, sent straight to the lead API. */
export function DemoLeadForm({ onDone }: DemoLeadFormProps) {
  const t = useTranslations('auth.login.demoGuide.lead');
  const http = useHttpClient();
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const { control, handleSubmit, setError } = useZodForm(demoLeadSchema, {
    name: '',
    phone_country: 'EG',
    phone: '',
  });
  const send = useMutation({
    mutationFn: (values: DemoLeadValues) => postDemoLead(http, { ...values, ...readAttribution() }),
  });

  const submit = (values: DemoLeadValues) => {
    setAlertMessages([]);
    send.mutate(values, {
      onSuccess: onDone,
      onError: (error) => {
        if (!isApiError(error)) return;
        setAlertMessages(mapLaravelErrorsToForm(error, setError, LEAD_FIELDS).unmapped);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      <p className="text-caption text-muted-foreground">{t('description')}</p>
      <FormAlert messages={alertMessages} />
      <TextField
        control={control}
        name="name"
        label={t('name')}
        icon={UserRound}
        autoComplete="name"
        isRequired
      />
      <div className="grid grid-cols-[8rem_1fr] gap-2">
        <SelectField
          control={control}
          name="phone_country"
          label={t('country')}
          options={DEMO_PHONE_COUNTRIES.map((code) => ({
            value: code,
            label: t(`countries.${code}`),
          }))}
          isRequired
        />
        <TextField
          control={control}
          name="phone"
          label={t('phone')}
          type="tel"
          icon={Phone}
          autoComplete="tel-national"
          isLtr
          isRequired
        />
      </div>
      <Button type="submit" className="w-full" disabled={send.isPending}>
        {send.isPending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <ArrowRight className="rtl:rotate-180" aria-hidden />
        )}
        {t('submit')}
      </Button>
    </form>
  );
}
