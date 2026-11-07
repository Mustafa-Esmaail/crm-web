import type { ReactNode } from 'react';

import { LocaleSwitcher } from '@/shared/components/layout/locale-switcher';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';

import { AuthBrandPanel } from './auth-brand-panel';

/** Brand panel first in the DOM, so it lands on the start side in both RTL and LTR. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <AuthBrandPanel />
      <div className="flex flex-col">
        <div className="flex justify-end gap-2 p-4 lg:px-8">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
