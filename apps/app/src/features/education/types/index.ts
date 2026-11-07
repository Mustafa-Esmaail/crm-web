import { paginatedSchema } from '@crm/api-client';
import { z } from 'zod';

const money = z.union([z.string(), z.number()]).nullable();

// CourseResource; seats_taken is sent with lists (a count of current enrollments).
export const courseSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_ar: z.string(),
  name_en: z.string().nullable(),
  code: z.string().nullable(),
  fee: money,
  capacity: z.number().nullable(),
  seats_taken: z.number().optional(),
  starts_on: z.string().nullable(),
  ends_on: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string().nullable(),
});

export const ENROLLMENT_STATUSES = ['enrolled', 'completed', 'dropped'] as const;

// EnrollmentResource: the student is a lead, sent by id only.
export const enrollmentSchema = z.object({
  id: z.number(),
  course: z.object({ id: z.number(), name: z.string(), code: z.string().nullable() }).optional(),
  lead_id: z.number(),
  status: z.enum(ENROLLMENT_STATUSES),
  enrolled_on: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const courseListSchema = paginatedSchema(courseSchema);
export const enrollmentListSchema = paginatedSchema(enrollmentSchema);

export type Course = z.infer<typeof courseSchema>;
export type Enrollment = z.infer<typeof enrollmentSchema>;
