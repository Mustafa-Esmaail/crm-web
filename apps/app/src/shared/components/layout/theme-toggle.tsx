'use client';

import { Button } from '@crm/ui';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const t = useTranslations('shell');
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={t('toggleTheme')}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {/* Both icons render and CSS picks one, so there is no hydration mismatch before the theme resolves. */}
      <Sun className="dark:hidden" strokeWidth={1.75} aria-hidden />
      <Moon className="hidden dark:block" strokeWidth={1.75} aria-hidden />
    </Button>
  );
}
