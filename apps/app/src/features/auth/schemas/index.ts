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

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
