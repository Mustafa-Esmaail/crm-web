import { z } from 'zod';

import { INDUSTRIES, SUPPORTED_FORM_LOCALES } from '../constants';

// Messages are i18n keys; FormField translates them, so schemas stay language-free.
const required = 'validation.required';

export const loginSchema = z.object({
  email: z.string().min(1, required).email('validation.email'),
  password: z.string().min(1, required),
});

const MIN_PASSWORD_LENGTH = 8;

export const registerSchema = z
  .object({
    company_name: z.string().trim().min(1, required).max(150, 'validation.maxLength'),
    industry: z.enum(INDUSTRIES, { error: required }),
    name: z.string().trim().min(1, required).max(150, 'validation.maxLength'),
    email: z.string().min(1, required).email('validation.email'),
    phone: z.string().max(30, 'validation.maxLength'),
    password: z.string().min(MIN_PASSWORD_LENGTH, 'validation.passwordTooShort'),
    password_confirmation: z.string().min(1, required),
    locale: z.enum(SUPPORTED_FORM_LOCALES),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'validation.passwordMismatch',
  });

/** Countries the demo phone form offers; the API checks the number against each one's mobile format. */
export const DEMO_PHONE_COUNTRIES = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM'] as const;

export const demoLeadSchema = z.object({
  name: z.string().trim().min(2, required).max(100, 'validation.maxLength'),
  phone_country: z.enum(DEMO_PHONE_COUNTRIES),
  phone: z.string().trim().min(1, required).max(30, 'validation.maxLength'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type DemoLeadValues = z.infer<typeof demoLeadSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
