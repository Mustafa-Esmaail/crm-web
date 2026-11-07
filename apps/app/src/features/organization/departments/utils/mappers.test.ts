import { describe, expect, it } from 'vitest';

import type { Department } from '../types';
import {
  EMPTY_DEPARTMENT_FORM,
  getParentOptions,
  toDepartmentFormValues,
  toDepartmentPayload,
  toMovePayload,
} from './mappers';

const node = (
  id: number,
  name: string,
  children: Department[] = [],
  parent_id: number | null = null,
): Department => ({
  id,
  parent_id,
  name,
  name_ar: name,
  is_active: true,
  children,
});

// Sales (1) > Inbound (2) > Warm (4);  Sales (1) > Outbound (3);  Support (5)
const tree: Department[] = [
  node(1, 'Sales', [node(2, 'Inbound', [node(4, 'Warm', [], 2)], 1), node(3, 'Outbound', [], 1)]),
  node(5, 'Support'),
];

describe('getParentOptions', () => {
  it('lists every department in tree order with its depth, without baking indentation into the text', () => {
    expect(getParentOptions(tree).map(({ label, depth }) => [label, depth])).toEqual([
      ['Sales', 0],
      ['Inbound', 1],
      ['Warm', 2],
      ['Outbound', 1],
      ['Support', 0],
    ]);
  });

  it('leaves out the edited department and everything beneath it, so a cycle cannot be picked', () => {
    const ids = getParentOptions(tree, 2).map((option) => option.value);

    expect(ids).toEqual(['1', '3', '5']);
    expect(ids).not.toContain('2');
    expect(ids).not.toContain('4');
  });

  it('keeps siblings and ancestors available', () => {
    expect(getParentOptions(tree, 3).map((option) => option.value)).toEqual(['1', '2', '4', '5']);
  });
});

describe('toDepartmentPayload', () => {
  it('sends ids as integers and cleared inputs as null', () => {
    expect(
      toDepartmentPayload({
        ...EMPTY_DEPARTMENT_FORM,
        name_ar: ' قسم ',
        parent_id: '7',
        branch_id: '2',
      }),
    ).toEqual({
      name_ar: 'قسم',
      name_en: null,
      code: null,
      parent_id: 7,
      branch_id: 2,
      manager_id: null,
      is_active: true,
    });
  });
});

describe('toDepartmentFormValues', () => {
  it('shows a root department with an empty parent', () => {
    expect(toDepartmentFormValues(node(1, 'Sales')).parent_id).toBe('');
  });

  it('round-trips the relations through picker strings', () => {
    const department: Department = {
      ...node(2, 'Inbound', [], 1),
      branch: { id: 9, name: 'Cairo' },
      manager: { id: 4, name: 'Layla' },
    };

    const values = toDepartmentFormValues(department);

    expect(values).toMatchObject({ parent_id: '1', branch_id: '9', manager_id: '4' });
    expect(toDepartmentPayload(values)).toMatchObject({
      parent_id: 1,
      branch_id: 9,
      manager_id: 4,
    });
  });
});

describe('toMovePayload', () => {
  it('moves to a parent, or to the root with null', () => {
    expect(toMovePayload({ parent_id: '3' })).toEqual({ parent_id: 3 });
    expect(toMovePayload({ parent_id: '' })).toEqual({ parent_id: null });
  });
});
