'use client';

import { isApiError } from '@crm/api-client';
import { Button } from '@crm/ui';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Link } from '@/lib/i18n/navigation';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useDemoConfig } from '../hooks/use-demo-config';
import { useLoginMutation } from '../hooks/use-session-mutations';
import { loginSchema, type LoginValues } from '../schemas';
import { DemoAccountsPanel } from './demo-accounts-panel';

const LOGIN_FIELDS = ['email', 'password'];

export function LoginForm() {
  const t = useTranslations('auth');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const { control, handleSubmit, setError } = useZodForm(loginSchema, { email: '', password: '' });
  const login = useLoginMutation();
  const demo = useDemoConfig();
  // The API's DEMO flag decides; nothing is offered until it says so.
  const demoAccess =
    demo.data?.enabled && demo.data.password && demo.data.accounts.length > 0
      ? { accounts: demo.data.accounts, password: demo.data.password }
      : null;

  const submit = (values: LoginValues) => {
    setAlertMessages([]);
    login.mutate(values, {
      onError: (error) => {
        if (!isApiError(error)) return;
        setAlertMessages(mapLaravelErrorsToForm(error, setError, LOGIN_FIELDS).unmapped);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-title font-bold">
          {t('login.title')} <span aria-hidden>👋</span>
        </h1>
        <p className="text-small text-muted-foreground">{t('login.description')}</p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        <FormAlert messages={alertMessages} />
        <TextField
          control={control}
          name="email"
          label={t('fields.email')}
          type="email"
          icon={Mail}
          autoComplete="email"
          isLtr
          isRequired
        />
        <TextField
          control={control}
          name="password"
          label={t('fields.password')}
          type="password"
          icon={Lock}
          autoComplete="current-password"
          isLtr
          isRequired
        />
        <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
          {login.isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="rtl:rotate-180" aria-hidden />
          )}
          {t('login.submit')}
        </Button>
      </form>

      {demoAccess ? (
        <>
          <div className="text-caption text-text-faint flex items-center gap-3" aria-hidden>
            <span className="bg-border h-px flex-1" />
            {t('login.or')}
            <span className="bg-border h-px flex-1" />
          </div>
          <DemoAccountsPanel
            accounts={demoAccess.accounts}
            password={demoAccess.password}
            pendingEmail={login.isPending ? (login.variables?.email ?? null) : null}
            onSignIn={(email) => submit({ email, password: demoAccess.password })}
          />
        </>
      ) : (
        <p className="text-small text-muted-foreground text-center">
          {t('login.noAccount')}{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t('login.register')}
          </Link>
        </p>
      )}
    </div>
  );
}
