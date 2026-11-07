import type { HttpClient } from '@/lib/api/http-client';
import type { QueryParams } from '@/lib/api/query-string';

import { auditLogListSchema } from '../types';

export function getAuditLogs(http: HttpClient, params: QueryParams, signal?: AbortSignal) {
  return http.request('/audit-logs', auditLogListSchema, { params, signal });
}
