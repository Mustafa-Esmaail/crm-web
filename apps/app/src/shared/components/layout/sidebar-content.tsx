'use client';

import { Button, cn } from '@crm/ui';
import { ChevronsUpDown, LifeBuoy, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { UserAvatar } from '@/shared/components/display/user-avatar';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

import { SidebarNav } from './sidebar-nav';

export function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
  const t = useTranslations('shell');
  const tIndustries = useTranslations('auth.industries');
  const { user } = useCurrentUser();
  const tenant = user?.tenant;
  const companyName = tenant?.name ?? t('appName');
  // The API has no plan or subscription yet, so the line under the name is the company's industry.
  const industry = tenant && tenantIndustryLabel(tenant.industry);

  function tenantIndustryLabel(value: string) {
    return tIndustries.has(value) ? tIndustries(value) : value;
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className={cn('flex items-center gap-3 px-5', isCollapsed && 'justify-center px-0')}>
        <span
          aria-hidden
          className="bg-logo text-primary-foreground shadow-logo flex size-9 shrink-0 items-center justify-center rounded-md"
        >
          <Sparkles className="size-5" aria-hidden />
        </span>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-card-title text-sidebar-active-foreground truncate font-semibold">
              {t('appName')}
            </p>
            <p className="text-caption text-sidebar-heading truncate">{t('tagline')}</p>
          </div>
        )}
      </div>

      {!isCollapsed && (
        // Display only: the API has no multi-company membership yet, so there is nothing to switch to.
        <div className="bg-sidebar-elevated mx-3 flex items-center gap-3 rounded-md px-3 py-2.5">
          <UserAvatar id={tenant?.id ?? 0} name={companyName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-small text-sidebar-foreground truncate font-medium">{companyName}</p>
            {industry && <p className="text-caption text-sidebar-heading truncate">{industry}</p>}
          </div>
          <ChevronsUpDown className="text-sidebar-heading size-4 shrink-0" aria-hidden />
        </div>
      )}

      <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto">
        <SidebarNav isCollapsed={isCollapsed} />
      </div>

      {!isCollapsed && (
        <Button
          variant="ghost"
          disabled
          className="bg-sidebar-elevated text-sidebar-foreground mx-3 justify-start gap-3"
        >
          <LifeBuoy className="size-4.5" aria-hidden />
          {t('help.action')}
        </Button>
      )}
    </div>
  );
}
