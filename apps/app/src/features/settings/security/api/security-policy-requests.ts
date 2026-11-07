import type { HttpClient } from '@/lib/api/http-client';

import { securityPolicyResponseSchema } from '../types';

export function getSecurityPolicy(http: HttpClient, signal?: AbortSignal) {
  return http.request('/security-policy', securityPolicyResponseSchema, { signal });
}

/** Always 200, also when this first save creates the company's policy row. */
export function updateSecurityPolicy(http: HttpClient, body: unknown) {
  return http.request('/security-policy', securityPolicyResponseSchema, { method: 'PUT', body });
}
