'use client';

import { cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@crm/ui';
import { type OnChangeFn, type RowData, useTable } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { ErrorState } from '../feedback/error-state';
import { TableSkeletonRows } from '../feedback/loading-skeleton';
import {
  type ColumnVisibility,
  type DataTableColumn,
  dataTableFeatures,
  type RowSelection,
  type SortState,
} from './types';

const NOOP = () => undefined;
const DEFAULT_SKELETON_ROWS = 8;

interface DataTableContentProps<TData extends RowData> {
  columns: DataTableColumn<TData>[];
  /** Must be a stable reference (query data or a module constant) or row models rebuild every render. */
  data: TData[];
  getRowId: (row: TData) => string;
  isLoading: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyState: ReactNode;
  rowSelection?: RowSelection;
  onRowSelectionChange?: OnChangeFn<RowSelection>;
  columnVisibility?: ColumnVisibility;
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibility>;
  sort?: SortState | null;
  sortableColumns?: readonly string[];
  onSortChange?: (columnId: string) => void;
  skeletonRows?: number;
}

export function DataTableContent<TData extends RowData>({
  columns,
  data,
  getRowId,
  isLoading,
  error,
  onRetry,
  emptyState,
  rowSelection = {},
  onRowSelectionChange = NOOP,
  columnVisibility = {},
  onColumnVisibilityChange = NOOP,
  sort,
  sortableColumns = [],
  onSortChange,
  skeletonRows = DEFAULT_SKELETON_ROWS,
}: DataTableContentProps<TData>) {
  const t = useTranslations('dataTable');

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    state: { rowSelection, columnVisibility },
    onRowSelectionChange,
    onColumnVisibilityChange,
  });

  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  const renderBody = () => {
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={visibleColumnCount}>
            <ErrorState error={error} onRetry={onRetry} />
          </TableCell>
        </TableRow>
      );
    }
    if (isLoading) return <TableSkeletonRows rows={skeletonRows} columns={visibleColumnCount} />;
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={visibleColumnCount}>{emptyState}</TableCell>
        </TableRow>
      );
    }
    return rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() ? 'selected' : undefined}
        className="h-row hover:bg-surface-2 data-[state=selected]:bg-primary-soft"
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="text-small text-secondary-foreground px-3">
            <table.FlexRender cell={cell} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Table>
      <TableHeader className="bg-muted">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="hover:bg-transparent">
            {group.headers.map((header) => {
              const isSortable = sortableColumns.includes(header.column.id);
              const direction = sort?.columnId === header.column.id ? sort.direction : null;

              return (
                <TableHead
                  key={header.id}
                  aria-sort={
                    direction === 'asc'
                      ? 'ascending'
                      : direction === 'desc'
                        ? 'descending'
                        : undefined
                  }
                  className="text-caption text-muted-foreground h-11 px-3 text-start font-semibold"
                >
                  {header.isPlaceholder ? null : isSortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(header.column.id)}
                      className={cn('flex items-center gap-1.5', direction && 'text-foreground')}
                      aria-label={t('sortBy')}
                    >
                      <table.FlexRender header={header} />
                      {direction === 'asc' ? (
                        <ArrowUp className="size-3.5" aria-hidden />
                      ) : direction === 'desc' ? (
                        <ArrowDown className="size-3.5" aria-hidden />
                      ) : (
                        <ChevronsUpDown className="size-3.5" aria-hidden />
                      )}
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>{renderBody()}</TableBody>
    </Table>
  );
}
