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
import { useState, useSyncExternalStore } from 'react';

import { Link } from '@/lib/i18n/navigation';

import type { DemoConfig } from '../api/demo-requests';
import { DemoLeadForm } from './demo-lead-form';

/** Set once the visitor left their phone, so they are not asked again on this browser. */
export const LEAD_STORAGE_KEY = 'crm.demo-lead-sent';

function subscribeToStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function readStoredLead() {
  try {
    return window.localStorage.getItem(LEAD_STORAGE_KEY) === '1';
  } catch {
    // Storage blocked: the visitor is simply asked again.
    return false;
  }
}

const ROLE_ICONS: Partial<Record<string, LucideIcon>> = {
  owner: Crown,
  sales_manager: Briefcase,
  marketing: Megaphone,
  team_leader: Users,
  sales_agent: UserRound,
};

type DemoAccountsPanelProps = {
  /** The accounts the API offers, one per role. */
  accounts: DemoConfig['accounts'];
  password: string;
  /** Email of the account currently signing in, if any. */
  pendingEmail: string | null;
  onSignIn: (email: string) => void;
};

/** Demo guide on the login page: one-click sign-in per seeded role, plus a way out to a real account. */
export function DemoAccountsPanel({
  accounts,
  password,
  pendingEmail,
  onSignIn,
}: DemoAccountsPanelProps) {
  const t = useTranslations('auth.login.demoGuide');
  const isBusy = pendingEmail !== null;
  // The server renders "not yet"; the browser then reads what it stored on an earlier visit.
  const hasStoredLead = useSyncExternalStore(subscribeToStorage, readStoredLead, () => false);
  const [hasJustLeftPhone, setHasJustLeftPhone] = useState(false);
  const hasLeftPhone = hasStoredLead || hasJustLeftPhone;

  const unlock = () => {
    try {
      window.localStorage.setItem(LEAD_STORAGE_KEY, '1');
    } catch {
      // Storage blocked: the demo still opens for this visit.
    }
    setHasJustLeftPhone(true);
  };

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
          {hasLeftPhone && (
            <p className="text-caption text-muted-foreground">{t('description', { password })}</p>
          )}
        </div>

        {!hasLeftPhone && <DemoLeadForm onDone={unlock} />}

        <ul className="divide-border divide-y" hidden={!hasLeftPhone}>
          {accounts.map(({ role, email }) => {
            const Icon = ROLE_ICONS[role] ?? UserRound;
            // A role the web app has no label for yet still gets a usable button.
            const hasLabel = t.has(`roles.${role}`);
            const roleName = hasLabel ? t(`roles.${role}`) : email;
            const isPending = pendingEmail === email;

            return (
              <li key={email} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="bg-surface-2 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-small font-medium">{roleName}</p>
                  {hasLabel && (
                    <p className="text-caption text-muted-foreground">{t(`roles.${role}_hint`)}</p>
                  )}
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
