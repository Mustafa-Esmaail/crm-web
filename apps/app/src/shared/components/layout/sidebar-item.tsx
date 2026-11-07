'use client';

import { cn } from '@crm/ui';
import { useTranslations } from 'next-intl';

import type { NavItem } from '@/config/navigation';
import { Link, usePathname } from '@/lib/i18n/navigation';

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
}

const BASE =
  'flex h-control items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors';

export function SidebarItem({ item, isCollapsed }: SidebarItemProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const label = t(`items.${item.labelKey}`);
  const Icon = item.icon;

  const content = (
    <>
      <Icon className="size-4.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className={cn('truncate', isCollapsed && 'sr-only')}>{label}</span>
      {item.comingSoon && !isCollapsed && (
        <span className="text-caption ms-auto">{t('comingSoon')}</span>
      )}
    </>
  );

  if (item.comingSoon) {
    return (
      <span
        aria-disabled="true"
        title={label}
        className={cn(BASE, 'text-sidebar-foreground cursor-not-allowed opacity-45')}
      >
        {content}
      </span>
    );
  }

  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      title={label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        BASE,
        isActive
          ? 'bg-sidebar-active text-sidebar-active-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-elevated',
      )}
    >
      {content}
    </Link>
  );
}
