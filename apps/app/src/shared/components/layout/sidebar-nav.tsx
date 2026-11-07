'use client';

import { canPerform } from '@crm/api-client';
import { useTranslations } from 'next-intl';

import { NAVIGATION } from '@/config/navigation';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

import { SidebarItem } from './sidebar-item';

export function SidebarNav({ isCollapsed }: { isCollapsed: boolean }) {
  const t = useTranslations('nav');
  const { user } = useCurrentUser();

  // Hide, rather than disable, what the user may not open; sections left empty disappear too.
  // Pack items also need the company's industry: owners pass every permission check.
  const industry = user?.tenant?.industry;
  const sections = NAVIGATION.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        (!item.permission || canPerform(user, item.permission)) &&
        (!item.industry || item.industry === industry),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <nav aria-label={t('label')} className="flex flex-col gap-5 px-3 py-2">
      {sections.map((section) => (
        <div key={section.id} className="flex flex-col gap-1">
          {section.labelKey && !isCollapsed && (
            <h2 className="text-caption text-sidebar-heading px-3 pb-1 font-semibold">
              {t(`sections.${section.labelKey}`)}
            </h2>
          )}
          {section.items.map((item) => (
            <SidebarItem key={item.id} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
      ))}
    </nav>
  );
}
