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

/** Seeded by crm-api's DemoCompanySeeder; the demo button is hidden in production builds. */
export const DEMO_CREDENTIALS = { email: 'owner@demo.test', password: 'password' } as const;
export const IS_DEMO_LOGIN_ENABLED = process.env.NODE_ENV !== 'production';
