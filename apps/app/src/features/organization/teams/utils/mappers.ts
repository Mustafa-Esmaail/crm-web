import { emptyToNull, idOrNull } from '@/lib/utils/strings';
import type { FilterDefinition, FilterOption } from '@/shared/components/data-table/types';

import { TEAM_STATUS } from '../constants';
import type { TeamFormValues } from '../schemas';
import type { Team } from '../types';

export const EMPTY_TEAM_FORM: TeamFormValues = {
  department_id: '',
  name_ar: '',
  name_en: '',
  leader_id: '',
  is_active: true,
};

/** API resource -> form values (nulls become '' because inputs are always strings). */
export function toTeamFormValues(team: Team): TeamFormValues {
  return {
    department_id: team.department ? String(team.department.id) : '',
    name_ar: team.name_ar,
    name_en: team.name_en ?? '',
    leader_id: team.leader ? String(team.leader.id) : '',
    is_active: team.is_active,
  };
}

/** Form values -> request body; the department is required, so it is always a number. */
export function toTeamPayload(values: TeamFormValues) {
  return {
    department_id: Number(values.department_id),
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    leader_id: idOrNull(values.leader_id),
    is_active: values.is_active,
  };
}

export function getTeamStatus(team: Team): string {
  return team.is_active ? TEAM_STATUS.active : TEAM_STATUS.inactive;
}

export function createTeamFilters(
  t: (key: string) => string,
  departmentOptions: FilterOption[],
  isLoadingDepartments: boolean,
): FilterDefinition[] {
  return [
    {
      id: 'department_id',
      label: t('filters.department'),
      options: departmentOptions,
      isLoading: isLoadingDepartments,
    },
  ];
}
