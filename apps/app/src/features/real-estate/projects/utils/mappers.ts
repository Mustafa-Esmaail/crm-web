import { emptyToNull } from '@/lib/utils/strings';

import type { ProjectFormValues } from '../schemas';
import type { Project } from '../types';

export const EMPTY_PROJECT_FORM: ProjectFormValues = {
  name_ar: '',
  name_en: '',
  code: '',
  city: '',
  district: '',
  address: '',
  status: 'planning',
  delivery_date: '',
  description: '',
};

export function toProjectFormValues(project: Project): ProjectFormValues {
  return {
    name_ar: project.name_ar,
    name_en: project.name_en ?? '',
    code: project.code ?? '',
    city: project.city ?? '',
    district: project.district ?? '',
    address: project.address ?? '',
    status: project.status,
    delivery_date: project.delivery_date?.slice(0, 10) ?? '',
    description: project.description ?? '',
  };
}

export function toProjectPayload(values: ProjectFormValues) {
  return {
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    code: emptyToNull(values.code),
    city: emptyToNull(values.city),
    district: emptyToNull(values.district),
    address: emptyToNull(values.address),
    status: values.status,
    delivery_date: values.delivery_date === '' ? null : `${values.delivery_date}T00:00:00`,
    description: emptyToNull(values.description),
  };
}
