export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread-count'] as const,
};

/** How often the bell asks the API whether something new arrived. */
export const UNREAD_POLL_INTERVAL_MS = 60_000;

export const NOTIFICATIONS_PAGE_SIZE = 10;
