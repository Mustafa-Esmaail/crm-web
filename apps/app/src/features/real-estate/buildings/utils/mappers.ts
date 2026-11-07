import { emptyToNull } from '@/lib/utils/strings';

import type { BuildingFormValues } from '../schemas';
import type { Building } from '../types';

export const EMPTY_BUILDING_FORM: BuildingFormValues = {
  project_id: '',
  name_ar: '',
  name_en: '',
  code: '',
  floors_count: undefined,
};

export function toBuildingFormValues(building: Building): BuildingFormValues {
  return {
    project_id: String(building.project.id),
    name_ar: building.name_ar,
    name_en: building.name_en ?? '',
    code: building.code ?? '',
    floors_count: building.floors_count ?? undefined,
  };
}

export function toBuildingPayload(values: BuildingFormValues) {
  return {
    project_id: Number(values.project_id),
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    code: emptyToNull(values.code),
    floors_count: values.floors_count ?? null,
  };
}
