import { cn } from '@crm/ui';
import type { ComponentProps } from 'react';

import { DataTableContent } from './data-table-content';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

function Root({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('bg-card shadow-card overflow-hidden rounded-lg border', className)}
      {...props}
    />
  );
}

/**
 * Compound: each part is independently typed and takes only what it uses.
 *   <DataTable><DataTable.Toolbar/><DataTable.Content/><DataTable.Pagination/></DataTable>
 */
export const DataTable = Object.assign(Root, {
  Toolbar: DataTableToolbar,
  Content: DataTableContent,
  Pagination: DataTablePagination,
});
