'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notification-requests';
import { notificationKeys, NOTIFICATIONS_PAGE_SIZE, UNREAD_POLL_INTERVAL_MS } from '../constants';

export function useUnreadCount() {
  const http = useHttpClient();

  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: ({ signal }) => getUnreadCount(http, signal),
    select: (response) => response.data.unread,
    refetchInterval: UNREAD_POLL_INTERVAL_MS,
  });
}

/** Fetched only while the list is open, so a closed bell costs one cheap count request. */
export function useNotificationList(isOpen: boolean) {
  const http = useHttpClient();

  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ signal }) => getNotifications(http, NOTIFICATIONS_PAGE_SIZE, signal),
    select: (response) => response.data,
    enabled: isOpen,
  });
}

function useRefreshNotifications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useMarkRead() {
  const http = useHttpClient();
  const refresh = useRefreshNotifications();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(http, id),
    onSuccess: refresh,
    onError: toastUnexpected,
  });
}

export function useMarkAllRead() {
  const http = useHttpClient();
  const refresh = useRefreshNotifications();
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(http),
    onSuccess: refresh,
    onError: toastUnexpected,
  });
}
