import { userSchema } from '@crm/api-client';
import { z } from 'zod';

import { requestAuthAction } from '@/lib/auth/auth-client';

// The BFF hands back only the user; the token stays in the httpOnly cookie.
const sessionResponseSchema = z.object({ user: userSchema });

interface SessionRequest {
  locale: string;
  body: unknown;
  fallbackMessage: string;
}

export function postLogin({ locale, body, fallbackMessage }: SessionRequest) {
  return requestAuthAction({
    action: 'login',
    schema: sessionResponseSchema,
    locale,
    body,
    fallbackMessage,
  });
}

export function postRegister({ locale, body, fallbackMessage }: SessionRequest) {
  return requestAuthAction({
    action: 'register',
    schema: sessionResponseSchema,
    locale,
    body,
    fallbackMessage,
  });
}
