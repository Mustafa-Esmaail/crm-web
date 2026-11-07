'use client';

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from '@crm/ui';
import { Bell, BellOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { RelativeTime } from '@/shared/components/display/relative-time';
import { EmptyState } from '@/shared/components/feedback/empty-state';

import {
  useMarkAllRead,
  useMarkRead,
  useNotificationList,
  useUnreadCount,
} from '../hooks/use-notifications';

const MAX_BADGE = 9;

export function NotificationsBell() {
  const t = useTranslations('notifications');
  const [isOpen, setIsOpen] = useState(false);
  const unread = useUnreadCount().data ?? 0;
  const list = useNotificationList(isOpen);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hidden sm:inline-flex"
          aria-label={unread > 0 ? t('withUnread', { count: unread }) : t('title')}
        >
          <Bell strokeWidth={1.75} aria-hidden />
          {unread > 0 && (
            <span
              className="bg-destructive text-caption num absolute -end-1 -top-1 flex min-w-4 items-center justify-center rounded-full px-1 leading-4 font-semibold text-white"
              aria-hidden
            >
              {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-small font-semibold">{t('title')}</p>
          <Button
            variant="ghost"
            size="sm"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            {t('markAllRead')}
          </Button>
        </div>
        <ul className="max-h-96 divide-y overflow-y-auto">
          {list.isPending && isOpen && (
            <li className="text-small text-muted-foreground px-4 py-6 text-center">
              {t('loading')}
            </li>
          )}
          {list.data?.length === 0 && (
            <li>
              <EmptyState icon={BellOff} title={t('empty')} className="py-8" />
            </li>
          )}
          {list.data?.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                disabled={notification.is_read || markRead.isPending}
                onClick={() => markRead.mutate(notification.id)}
                className={cn(
                  'hover:bg-muted flex w-full items-start gap-3 px-4 py-3 text-start disabled:cursor-default',
                  !notification.is_read && 'bg-primary-soft/40',
                )}
              >
                <span
                  className={cn(
                    'mt-1.5 size-2 shrink-0 rounded-full',
                    notification.is_read ? 'bg-transparent' : 'bg-primary',
                  )}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="text-small text-foreground block">{notification.message}</span>
                  <span className="text-caption text-text-faint block">
                    <RelativeTime value={notification.created_at} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
