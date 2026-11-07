'use client';

import { Button, cn, Sheet, SheetContent, SheetDescription, SheetTitle } from '@crm/ui';
import { ChevronsLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getDirection, isLocale } from '@/lib/i18n/routing';
import { useUiStore } from '@/shared/stores/ui-store';

import { SidebarContent } from './sidebar-content';

export function Sidebar() {
  const t = useTranslations('shell');
  const locale = useLocale();
  const { isSidebarCollapsed, isMobileNavOpen, toggleSidebar, setMobileNavOpen } = useUiStore();

  // The drawer slides in from the reading-start edge, which is the physical right in Arabic.
  const drawerSide = isLocale(locale) && getDirection(locale) === 'rtl' ? 'right' : 'left';

  return (
    <>
      <aside
        className={cn(
          'bg-sidebar sticky top-0 hidden h-dvh shrink-0 transition-[width] duration-200 lg:block',
          isSidebarCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        )}
      >
        <SidebarContent isCollapsed={isSidebarCollapsed} />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isSidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          aria-expanded={!isSidebarCollapsed}
          onClick={toggleSidebar}
          className="text-sidebar-heading hover:bg-sidebar-elevated hover:text-sidebar-foreground absolute end-3 top-5"
        >
          <ChevronsLeft
            className={cn('rtl:rotate-180', isSidebarCollapsed && 'rotate-180 rtl:rotate-0')}
            aria-hidden
          />
        </Button>
      </aside>

      <Sheet open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side={drawerSide}
          className="w-sidebar bg-sidebar [&>button]:text-sidebar-foreground border-0 p-0 lg:hidden"
        >
          <SheetTitle className="sr-only">{t('navigation')}</SheetTitle>
          <SheetDescription className="sr-only">{t('navigationDescription')}</SheetDescription>
          <SidebarContent isCollapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}
