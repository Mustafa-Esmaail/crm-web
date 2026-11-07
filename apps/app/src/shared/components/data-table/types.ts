import {
  type ColumnDef,
  columnVisibilityFeature,
  type ColumnVisibilityState,
  createColumnHelper,
  type RowData,
  rowSelectionFeature,
  type RowSelectionState,
  tableFeatures,
} from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';

// Stable module-level features: v9 derives every table type from this object.
export const dataTableFeatures = tableFeatures({ columnVisibilityFeature, rowSelectionFeature });

export type DataTableColumn<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData>;

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, TData>();
}

export type RowSelection = RowSelectionState;
export type ColumnVisibility = ColumnVisibilityState;

export interface SortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Every table filter obeys this one contract, so chips are interchangeable. A filter with
 * `useOptions` searches the server as the user types (large lists such as employees); without
 * it, `options` is the whole list.
 */
export interface FilterDefinition {
  id: string;
  label: string;
  options: FilterOption[];
  icon?: LucideIcon;
  isLoading?: boolean;
  useOptions?: (search: string) => { options: FilterOption[]; isLoading: boolean };
  /** Resolves the label of a selected value that is not in the loaded options (e.g. after a reload). */
  useSelectedLabel?: (value: string | null | undefined) => string | undefined;
}

export type FilterValues = Record<string, string | null | undefined>;

export interface ColumnToggleItem {
  id: string;
  label: string;
}
