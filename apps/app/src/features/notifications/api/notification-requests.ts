import type { HttpClient } from '@/lib/api/http-client';

import {
  markedAllSchema,
  notificationListSchema,
  notificationResponseSchema,
  unreadCountSchema,
} from '../types';

export function getNotifications(http: HttpClient, perPage: number, signal?: AbortSignal) {
  return http.request('/notifications', notificationListSchema, {
    params: { per_page: perPage },
    signal,
  });
}

export function getUnreadCount(http: HttpClient, signal?: AbortSignal) {
  return http.request('/notifications/unread-count', unreadCountSchema, { signal });
}

export function markNotificationRead(http: HttpClient, id: string) {
  return http.request(`/notifications/${id}/read`, notificationResponseSchema, { method: 'POST' });
}

export function markAllNotificationsRead(http: HttpClient) {
  return http.request('/notifications/read-all', markedAllSchema, { method: 'POST' });
}
