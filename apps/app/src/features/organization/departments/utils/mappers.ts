import { emptyToNull, idOrNull } from '@/lib/utils/strings';
import type { FilterDefinition, FilterOption } from '@/shared/components/data-table/types';
import type { SelectOption } from '@/shared/components/form/field-types';

import { DEPARTMENT_STATUS } from '../constants';
import type { DepartmentFormValues, MoveDepartmentValues } from '../schemas';
import type { Department } from '../types';

export const EMPTY_DEPARTMENT_FORM: DepartmentFormValues = {
  name_ar: '',
  name_en: '',
  code: '',
  parent_id: '',
  branch_id: '',
  manager_id: '',
  is_active: true,
};

/** API resource -> form values (nulls become '' because inputs are always strings). */
export function toDepartmentFormValues(department: Department): DepartmentFormValues {
  return {
    name_ar: department.name_ar,
    name_en: department.name_en ?? '',
    code: department.code ?? '',
    parent_id: department.parent_id === null ? '' : String(department.parent_id),
    branch_id: department.branch ? String(department.branch.id) : '',
    manager_id: department.manager ? String(department.manager.id) : '',
    is_active: department.is_active,
  };
}

/** Form values -> request body. */
export function toDepartmentPayload(values: DepartmentFormValues) {
  return {
    name_ar: values.name_ar.trim(),
    name_en: emptyToNull(values.name_en),
    code: emptyToNull(values.code),
    parent_id: idOrNull(values.parent_id),
    branch_id: idOrNull(values.branch_id),
    manager_id: idOrNull(values.manager_id),
    is_active: values.is_active,
  };
}

/** A move sends only the parent: the API applies it as a partial update. */
export function toMovePayload(values: MoveDepartmentValues) {
  return { parent_id: idOrNull(values.parent_id) };
}

export function getDepartmentStatus(department: Department): string {
  return department.is_active ? DEPARTMENT_STATUS.active : DEPARTMENT_STATUS.inactive;
}

/**
 * Tree -> flat picker options carrying their depth (the select indents them). Pass `excludedId` when picking a parent for an
 * existing department: it and everything under it are left out, since placing it there would
 * create the cycle the API rejects.
 */
export function getParentOptions(tree: Department[], excludedId?: number): SelectOption[] {
  const options: SelectOption[] = [];

  const visit = (nodes: Department[], depth: number) => {
    for (const node of nodes) {
      if (node.id === excludedId) continue;
      options.push({ value: String(node.id), label: node.name, depth });
      visit(node.children ?? [], depth + 1);
    }
  };
  visit(tree, 0);

  return options;
}

export function createDepartmentFilters(
  t: (key: string) => string,
  branchOptions: FilterOption[],
  isLoadingBranches: boolean,
): FilterDefinition[] {
  return [
    {
      id: 'branch_id',
      label: t('filters.branch'),
      options: branchOptions,
      isLoading: isLoadingBranches,
    },
  ];
}
