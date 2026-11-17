'use client';

import { Button } from '@crm/ui';
import {
  Briefcase,
  Crown,
  Loader2,
  LogIn,
  type LucideIcon,
  Megaphone,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/lib/i18n/navigation';

import { DEMO_ACCOUNTS, type DemoRole } from '../constants';

const ROLE_ICONS: Record<DemoRole, LucideIcon> = {
  owner: Crown,
  sales_manager: Briefcase,
  marketing: Megaphone,
  team_leader: Users,
  sales_agent: UserRound,
};

type DemoAccountsPanelProps = {
  /** Email of the account currently signing in, if any. */
  pendingEmail: string | null;
  onSignIn: (email: string) => void;
};

/** Demo guide on the login page: one-click sign-in per seeded role, plus a way out to a real account. */
export function DemoAccountsPanel({ pendingEmail, onSignIn }: DemoAccountsPanelProps) {
  const t = useTranslations('auth.login.demoGuide');
  const isBusy = pendingEmail !== null;

  return (
    <div className="space-y-4">
      <section
        aria-labelledby="demo-guide-title"
        className="border-border bg-card space-y-3 rounded-lg border p-4"
      >
        <div className="space-y-1">
          <h2 id="demo-guide-title" className="flex items-center gap-2 font-semibold">
            <Sparkles className="text-primary size-4" aria-hidden />
            {t('title')}
          </h2>
          <p className="text-caption text-muted-foreground">{t('description')}</p>
        </div>

        <ul className="divide-border divide-y">
          {DEMO_ACCOUNTS.map(({ role, email }) => {
            const Icon = ROLE_ICONS[role];
            const roleName = t(`roles.${role}`);
            const isPending = pendingEmail === email;

            return (
              <li key={role} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="bg-surface-2 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-small font-medium">{roleName}</p>
                  <p className="text-caption text-muted-foreground">{t(`roles.${role}_hint`)}</p>
                  <p className="text-caption text-text-faint truncate" dir="ltr">
                    {email}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => onSignIn(email)}
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <LogIn className="rtl:rotate-180" aria-hidden />
                  )}
                  {t('signInAs', { role: roleName })}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-border flex items-center gap-3 rounded-lg border border-dashed p-4">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-small font-semibold">{t('ownTitle')}</p>
          <p className="text-caption text-muted-foreground">{t('ownDescription')}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/register">
            <UserPlus aria-hidden />
            {t('ownAction')}
          </Link>
        </Button>
      </section>
    </div>
  );
}
