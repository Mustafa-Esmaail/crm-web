'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@crm/ui';
import { Columns3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ColumnToggleItem, ColumnVisibility } from './types';

interface ColumnToggleProps {
  columns: ColumnToggleItem[];
  visibility: ColumnVisibility;
  onVisibilityChange: (columnId: string, isVisible: boolean) => void;
}

export function ColumnToggle({ columns, visibility, onVisibilityChange }: ColumnToggleProps) {
  const t = useTranslations('dataTable');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns3 aria-hidden />
          {t('columns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{t('toggleColumns')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibility[column.id] !== false}
            onCheckedChange={(isChecked) => onVisibilityChange(column.id, isChecked)}
            onSelect={(event) => event.preventDefault()}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
