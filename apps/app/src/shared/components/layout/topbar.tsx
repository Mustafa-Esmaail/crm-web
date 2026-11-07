'use client';

import { Button } from '@crm/ui';
import { Menu, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useUiStore } from '@/shared/stores/ui-store';

import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

interface TopbarProps {
  /** The notifications bell; a feature supplies it, because shared/ cannot import features. */
  notifications?: ReactNode;
}

export function Topbar({ notifications }: TopbarProps) {
  const t = useTranslations('shell');
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <header className="h-topbar bg-card sticky top-0 z-30 flex items-center gap-3 border-b px-4 lg:px-7">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label={t('openMenu')}
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu aria-hidden />
      </Button>

      {/* The command palette arrives later; the field is shown disabled so the layout is final. */}
      <button
        type="button"
        disabled
        className="h-field bg-muted text-small text-text-faint flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3 disabled:cursor-not-allowed sm:max-w-md"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 truncate text-start">{t('search')}</span>
        <kbd
          dir="ltr"
          className="num bg-card text-caption hidden rounded-sm border px-1.5 sm:block"
        >
          Ctrl K
        </kbd>
      </button>

      <div className="ms-auto flex shrink-0 items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
        {notifications}
        <UserMenu />
      </div>
    </header>
  );
}
