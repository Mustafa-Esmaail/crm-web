'use client';

import { useMemo } from 'react';

import type { SelectOption } from '@/shared/components/form/field-types';

import { getParentOptions } from '../utils/mappers';
import { useDepartmentTreeQuery } from './use-departments-queries';

/** Every department as picker options in tree order (with depth), for other features' selects and filters. */
export function useDepartmentOptions(): { options: SelectOption[]; isLoading: boolean } {
  const tree = useDepartmentTreeQuery();
  const options = useMemo(() => getParentOptions(tree.data ?? []), [tree.data]);

  return { options, isLoading: tree.isLoading };
}
