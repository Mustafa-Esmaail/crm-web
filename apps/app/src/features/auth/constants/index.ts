/** Industry keys exactly as the API's Industry enum issues them. */
export const INDUSTRIES = [
  'real_estate',
  'education',
  'clinic',
  'automotive',
  'agency',
  'other',
] as const;

export const SUPPORTED_FORM_LOCALES = ['ar', 'en'] as const;

export const DEVICE_NAME = 'web';

/**
 * Seeded by crm-api's DemoCompanySeeder; used by the e2e helpers. The login page itself gets the
 * demo accounts from the API (GET /auth/demo), which only offers them while its DEMO flag is on.
 */
export const DEMO_CREDENTIALS = { email: 'owner@demo.test', password: 'password' } as const;
