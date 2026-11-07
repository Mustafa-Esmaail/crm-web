import { type ReactNode, Suspense } from 'react';

import { NotificationsBell } from '@/features/notifications';
import { PageSkeleton } from '@/shared/components/feedback/page-skeleton';
import { AppShell } from '@/shared/components/layout/app-shell';
import { AuthProvider } from '@/shared/providers/auth-provider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppShell notifications={<NotificationsBell />}>
        {/* URL-synced tables read search params on the client; Next requires a boundary for that. */}
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </AppShell>
    </AuthProvider>
  );
}
