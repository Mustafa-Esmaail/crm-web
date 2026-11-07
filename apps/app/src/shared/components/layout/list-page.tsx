'use client';

import type { PaginationMeta } from '@crm/api-client';
import { Button } from '@crm/ui';
import type { RowData } from '@tanstack/react-table';
import { type LucideIcon, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useCurrentUser } from '../../hooks/use-current-user';
import { DataTable } from '../data-table/data-table';
import type { DataTableColumn, FilterDefinition, FilterValues } from '../data-table/types';
import { EmptyState } from '../feedback/empty-state';
import { NoPermission } from '../feedback/no-permission';
import { PageHeader } from './page-header';

interface ListPageProps<TData extends RowData> {
  title: string;
  description: string;
  /** Breadcrumb label of the sidebar section the page lives in. */
  sectionLabel: string;
  /** False shows "no permission" instead of the table (missing permission or other industry). */
  canView: boolean;
  /** Shown only when given: the caller decides whether the viewer may create. */
  create?: { label: string; onClick: () => void };
  search?: { value: string; onChange: (value: string) => void; placeholder: string };
  filters?: FilterDefinition[];
  filterValues?: FilterValues;
  onFilterChange?: (filterId: string, value: string | null) => void;
  onClearAll?: () => void;
  columns: DataTableColumn<TData>[];
  rows: TData[];
  getRowId: (row: TData) => string;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  empty: { icon: LucideIcon; title: string; description: string };
  /** Dialogs the page opens. */
  children?: ReactNode;
}

/** The standard list screen: header with breadcrumbs and a create button, then a filtered table. */
export function ListPage<TData extends RowData>({
  title,
  description,
  sectionLabel,
  canView,
  create,
  search,
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
  columns,
  rows,
  getRowId,
  isLoading,
  error,
  onRetry,
  meta,
  onPageChange,
  onPerPageChange,
  empty,
  children,
}: ListPageProps<TData>) {
  const tNav = useTranslations('nav');
  // Permissions and industry come with the signed-in user; until it loads, `canView` is false
  // for everyone, so show the table loading rather than a "no permission" flash.
  const { isLoading: isUserLoading } = useCurrentUser();
  const showTable = canView || isUserLoading;

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: sectionLabel },
              { label: title },
            ]}
          />
          <PageHeader.Title>{title}</PageHeader.Title>
          <PageHeader.Description>{description}</PageHeader.Description>
        </PageHeader.Heading>
        {canView && create && (
          <PageHeader.Actions>
            <Button onClick={create.onClick}>
              <Plus aria-hidden />
              {create.label}
            </Button>
          </PageHeader.Actions>
        )}
      </PageHeader>

      {showTable ? (
        <DataTable>
          <DataTable.Toolbar
            searchValue={search?.value ?? ''}
            onSearchChange={search?.onChange ?? (() => undefined)}
            searchPlaceholder={search?.placeholder ?? ''}
            hideSearch={!search}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
          />
          <DataTable.Content
            columns={columns}
            data={rows}
            getRowId={getRowId}
            isLoading={isLoading || isUserLoading}
            error={error}
            onRetry={onRetry}
            emptyState={
              <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
            }
          />
          <DataTable.Pagination
            meta={meta}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        </DataTable>
      ) : (
        <NoPermission />
      )}

      {children}
    </>
  );
}
