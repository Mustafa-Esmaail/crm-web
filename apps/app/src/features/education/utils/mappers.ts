import { toNumber } from '@/lib/utils/number';
import { emptyToNull } from '@/lib/utils/strings';

import type { CourseFormValues, EnrollmentFormValues } from '../schemas';
import type { Course, Enrollment } from '../types';

const day = (value: string | null | undefined) => value?.slice(0, 10) ?? '';

export const EMPTY_COURSE_FORM: CourseFormValues = {
  name_ar: '',
  name_en: '',
  code: '',
  fee: undefined,
  capacity: undefined,
  starts_on: '',
  ends_on: '',
  is_active: true,
};

export function toCourseFormValues(course: Course): CourseFormValues {
  return {
    name_ar: course.name_ar,
    name_en: course.name_en ?? '',
    code: course.code ?? '',
    fee: toNumber(course.fee) ?? undefined,
    capacity: course.capacity ?? undefined,
    starts_on: day(course.starts_on),
    ends_on: day(course.ends_on),
    is_active: course.is_active,
  };
}

export function toCoursePayload(values: CourseFormValues) {
  return {
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    code: emptyToNull(values.code),
    fee: values.fee ?? null,
    // No capacity means unlimited seats.
    capacity: values.capacity ?? null,
    starts_on: emptyToNull(values.starts_on),
    ends_on: emptyToNull(values.ends_on),
    is_active: values.is_active,
  };
}

/** "12 / 30" seats, or just "12" when the course has no limit. */
export function seatsLabel(course: Pick<Course, 'seats_taken' | 'capacity'>): string {
  const taken = course.seats_taken ?? 0;
  return course.capacity ? `${taken} / ${course.capacity}` : String(taken);
}

export const EMPTY_ENROLLMENT_FORM: EnrollmentFormValues = {
  course_id: '',
  lead_id: '',
  status: 'enrolled',
  enrolled_on: '',
  notes: '',
};

export function toEnrollmentFormValues(enrollment: Enrollment): EnrollmentFormValues {
  return {
    course_id: String(enrollment.course?.id ?? ''),
    lead_id: String(enrollment.lead_id),
    status: enrollment.status,
    enrolled_on: day(enrollment.enrolled_on),
    notes: enrollment.notes ?? '',
  };
}

/** The course and student go only on create; the status only on edit (the API prohibits the rest). */
export function toEnrollmentPayload(values: EnrollmentFormValues, isCreate: boolean) {
  const shared = { enrolled_on: emptyToNull(values.enrolled_on), notes: emptyToNull(values.notes) };
  return isCreate
    ? { course_id: Number(values.course_id), lead_id: Number(values.lead_id), ...shared }
    : { status: values.status, ...shared };
}
