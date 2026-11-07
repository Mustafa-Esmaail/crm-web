'use client';

import { Checkbox } from '@crm/ui';
import type { RowData } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { DataTableColumn } from './types';

function SelectAllCheckbox({
  isAll,
  isSome,
  onToggle,
}: {
  isAll: boolean;
  isSome: boolean;
  onToggle: (isSelected: boolean) => void;
}) {
  const t = useTranslations('dataTable');
  return (
    <Checkbox
      aria-label={t('selectAll')}
      checked={isAll ? true : isSome ? 'indeterminate' : false}
      onCheckedChange={(value) => onToggle(value === true)}
    />
  );
}

function SelectRowCheckbox({
  isSelected,
  onToggle,
}: {
  isSelected: boolean;
  onToggle: (value: boolean) => void;
}) {
  const t = useTranslations('dataTable');
  return (
    <Checkbox
      aria-label={t('selectRow')}
      checked={isSelected}
      onCheckedChange={(v) => onToggle(v === true)}
    />
  );
}

export function createSelectionColumn<TData extends RowData>(): DataTableColumn<TData> {
  return {
    id: 'select',
    enableHiding: false,
    header: ({ table }) => (
      <SelectAllCheckbox
        isAll={table.getIsAllRowsSelected()}
        isSome={table.getIsSomeRowsSelected()}
        onToggle={(value) => table.toggleAllRowsSelected(value)}
      />
    ),
    cell: ({ row }) => (
      <SelectRowCheckbox
        isSelected={row.getIsSelected()}
        onToggle={(value) => row.toggleSelected(value)}
      />
    ),
  };
}

/** Row actions stay a render slot so each feature decides which buttons exist (and who may see them). */
export function createActionsColumn<TData extends RowData>(
  renderActions: (row: TData) => ReactNode,
): DataTableColumn<TData> {
  return {
    id: 'actions',
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => <div className="flex justify-end">{renderActions(row.original)}</div>,
  };
}
