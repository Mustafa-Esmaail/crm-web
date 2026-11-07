'use client';

import type { PaginationMeta } from '@crm/api-client';
import { Button, cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@crm/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getPageItems } from './page-numbers';

const PAGE_SIZE_OPTIONS = [10, 15, 30, 50, 100] as const;

interface DataTablePaginationProps {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function DataTablePagination({
  meta,
  onPageChange,
  onPerPageChange,
}: DataTablePaginationProps) {
  const t = useTranslations('dataTable');

  if (!meta || meta.total === 0) return null;

  return (
    <div className="bg-card text-small flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t('previousPage')}
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          <ChevronLeft className="rtl:rotate-180" aria-hidden />
        </Button>
        {getPageItems(meta.current_page, meta.last_page).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="text-text-faint px-1" aria-hidden>
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === meta.current_page ? 'default' : 'outline'}
              size="icon-sm"
              aria-label={t('goToPage', { page: item })}
              aria-current={item === meta.current_page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn('num', item !== meta.current_page && 'text-secondary-foreground')}
            >
              {item}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t('nextPage')}
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          <ChevronRight className="rtl:rotate-180" aria-hidden />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-muted-foreground flex items-center gap-2">
          {t('rowsPerPage')}
          <Select
            value={String(meta.per_page)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="num h-chip w-20" aria-label={t('rowsPerPage')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="num">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <p className="num text-muted-foreground">
          {t('range', { from: meta.from ?? 0, to: meta.to ?? 0, total: meta.total })}
        </p>
      </div>
    </div>
  );
}
