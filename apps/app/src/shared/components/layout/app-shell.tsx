import type { ReactNode } from 'react';

import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface AppShellProps {
  children: ReactNode;
  /** Slot for the top bar's notifications bell. */
  notifications?: ReactNode;
}

export function AppShell({ children, notifications }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar notifications={notifications} />
        <main className="flex-1 px-4 py-6 lg:px-7">{children}</main>
      </div>
    </div>
  );
}
