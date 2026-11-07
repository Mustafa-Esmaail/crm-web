'use client';

import { Button, Input } from '@crm/ui';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useState } from 'react';

import { useDebounce } from '@/shared/hooks/use-debounce';

import { ColumnToggle } from './column-toggle';
import { FilterChip } from './filter-chip';
import type { ColumnToggleItem, ColumnVisibility, FilterDefinition, FilterValues } from './types';

const SEARCH_DEBOUNCE_MS = 300;

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** For tables the API cannot search (e.g. the audit log). */
  hideSearch?: boolean;
  filters?: FilterDefinition[];
  filterValues?: FilterValues;
  onFilterChange?: (filterId: string, value: string | null) => void;
  onClearAll?: () => void;
  columnToggle?: {
    columns: ColumnToggleItem[];
    visibility: ColumnVisibility;
    onVisibilityChange: (columnId: string, isVisible: boolean) => void;
  };
  /** Extra controls placed after the chips, e.g. an "include sub-departments" switch. */
  children?: ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  hideSearch = false,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearAll,
  columnToggle,
  children,
}: DataTableToolbarProps) {
  const t = useTranslations('dataTable');
  const [draft, setDraft] = useState(searchValue);
  const debouncedDraft = useDebounce(draft, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedDraft !== searchValue) onSearchChange(debouncedDraft);
    // Only a settled draft should write to the URL; searchValue changing must not re-fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  const handleClearAll = () => {
    // The input keeps its own draft, so clearing the URL alone would leave the old text showing.
    setDraft('');
    onClearAll?.();
  };
  const hasActiveFilters = searchValue !== '' || Object.values(filterValues).some(Boolean);

  return (
    <div className="bg-card flex flex-wrap items-center gap-2 border-b p-3">
      {!hideSearch && (
        <div className="relative w-full max-w-xs min-w-48 flex-1">
          <Search
            className="text-text-faint pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="ps-9"
          />
        </div>
      )}

      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          definition={filter}
          value={filterValues[filter.id]}
          onChange={(value) => onFilterChange?.(filter.id, value)}
        />
      ))}
      {children}

      {hasActiveFilters && onClearAll && (
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          {t('clearAll')}
        </Button>
      )}

      {columnToggle && (
        <div className="ms-auto">
          <ColumnToggle {...columnToggle} />
        </div>
      )}
    </div>
  );
}
