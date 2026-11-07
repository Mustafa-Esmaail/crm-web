import 'server-only';

import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Parsed once at import so a missing variable fails the first request loudly, not a random one later.
export const env = envSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});
