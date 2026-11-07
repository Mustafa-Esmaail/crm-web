'use client';

import { isApiError } from '@crm/api-client';
import { Button } from '@crm/ui';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Link } from '@/lib/i18n/navigation';
import { isLocale } from '@/lib/i18n/routing';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { INDUSTRIES, SUPPORTED_FORM_LOCALES } from '../constants';
import { useRegisterMutation } from '../hooks/use-session-mutations';
import { registerSchema, type RegisterValues } from '../schemas';

const REGISTER_FIELDS = [
  'company_name',
  'industry',
  'name',
  'email',
  'phone',
  'password',
  'password_confirmation',
  'locale',
];

export function RegisterForm() {
  const t = useTranslations('auth');
  const currentLocale = useLocale();
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const register = useRegisterMutation();

  const { control, handleSubmit, setError } = useZodForm(registerSchema, {
    company_name: '',
    industry: undefined,
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    locale: isLocale(currentLocale) ? currentLocale : 'ar',
  });

  const industryOptions = INDUSTRIES.map((value) => ({ value, label: t(`industries.${value}`) }));
  const localeOptions = SUPPORTED_FORM_LOCALES.map((value) => ({
    value,
    label: t(`languages.${value}`),
  }));

  const submit = (values: RegisterValues) => {
    setAlertMessages([]);
    register.mutate(values, {
      onError: (error) => {
        if (!isApiError(error)) return;
        setAlertMessages(mapLaravelErrorsToForm(error, setError, REGISTER_FIELDS).unmapped);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-title font-bold">{t('register.title')}</h1>
        <p className="text-small text-muted-foreground">{t('register.description')}</p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        <FormAlert messages={alertMessages} />
        <TextField
          control={control}
          name="company_name"
          label={t('fields.companyName')}
          isRequired
        />
        <SelectField
          control={control}
          name="industry"
          label={t('fields.industry')}
          options={industryOptions}
          placeholder={t('fields.industryPlaceholder')}
          isRequired
        />
        <TextField
          control={control}
          name="name"
          label={t('fields.ownerName')}
          autoComplete="name"
          isRequired
        />
        <TextField
          control={control}
          name="email"
          label={t('fields.email')}
          type="email"
          autoComplete="email"
          isLtr
          isRequired
        />
        <TextField
          control={control}
          name="phone"
          label={t('fields.phone')}
          type="tel"
          autoComplete="tel"
          isLtr
        />
        <TextField
          control={control}
          name="password"
          label={t('fields.password')}
          type="password"
          autoComplete="new-password"
          isLtr
          isRequired
        />
        <TextField
          control={control}
          name="password_confirmation"
          label={t('fields.passwordConfirmation')}
          type="password"
          autoComplete="new-password"
          isLtr
          isRequired
        />
        <SelectField
          control={control}
          name="locale"
          label={t('fields.language')}
          options={localeOptions}
          isRequired
        />
        <Button type="submit" size="lg" className="w-full" disabled={register.isPending}>
          {register.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t('register.submit')}
        </Button>
      </form>

      <p className="text-small text-muted-foreground text-center">
        {t('register.haveAccount')}{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          {t('register.login')}
        </Link>
      </p>
    </div>
  );
}
