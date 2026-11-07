import { z } from 'zod';

import { ENROLLMENT_STATUSES } from '../types';

// Mirrors CourseRequest; messages are i18n keys translated by FormField.
export const courseFormSchema = z
  .object({
    name_ar: z.string().trim().min(1, 'validation.required').max(150, 'validation.maxLength'),
    name_en: z.string().max(150, 'validation.maxLength'),
    code: z.string().max(30, 'validation.maxLength'),
    fee: z.number('validation.number').min(0, 'validation.min').optional(),
    capacity: z
      .number('validation.number')
      .int('validation.number')
      .min(1, 'validation.min')
      .optional(),
    starts_on: z.string(),
    ends_on: z.string(),
    is_active: z.boolean(),
  })
  .refine((values) => !values.starts_on || !values.ends_on || values.ends_on >= values.starts_on, {
    path: ['ends_on'],
    message: 'validation.endBeforeStart',
  });

export type CourseFormValues = z.infer<typeof courseFormSchema>;

// Mirrors EnrollmentRequest. The course and the student are fixed once enrolled.
export const enrollmentFormSchema = z.object({
  course_id: z.string(),
  lead_id: z.string(),
  status: z.enum(ENROLLMENT_STATUSES),
  enrolled_on: z.string(),
  notes: z.string().max(5000, 'validation.maxLength'),
});

export const enrollmentCreateSchema = enrollmentFormSchema.extend({
  course_id: z.string().min(1, 'validation.required'),
  lead_id: z.string().min(1, 'validation.required'),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;
