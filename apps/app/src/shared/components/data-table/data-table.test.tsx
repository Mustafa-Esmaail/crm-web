import type { PaginationMeta } from '@crm/api-client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithIntl } from '../../../../tests/render';
import { DataTable } from './data-table';
import { createDataTableColumnHelper, type DataTableColumn } from './types';

interface Row {
  id: number;
  name: string;
}

const helper = createDataTableColumnHelper<Row>();
// helper.columns() is what lets accessors of different value types share one typed array.
const columns: DataTableColumn<Row>[] = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('id', { header: 'Code' }),
]);
const rows: Row[] = [
  { id: 1, name: 'Layla' },
  { id: 2, name: 'Omar' },
];

function renderContent(props: Partial<Parameters<typeof DataTable.Content<Row>>[0]> = {}) {
  return renderWithIntl(
    <DataTable.Content<Row>
      columns={columns}
      data={rows}
      getRowId={(row) => String(row.id)}
      isLoading={false}
      emptyState={<p>Nothing here</p>}
      {...props}
    />,
  );
}

describe('DataTable.Content', () => {
  it('renders a row per record under its headers', () => {
    renderContent();

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByText('Layla')).toBeInTheDocument();
    expect(screen.getByText('Omar')).toBeInTheDocument();
  });

  it('shows skeleton rows instead of data while loading', () => {
    renderContent({ isLoading: true, skeletonRows: 3 });

    expect(screen.queryByText('Layla')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(1 + 3);
  });

  it('shows the empty state when there are no rows', () => {
    renderContent({ data: [] });

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows the error with a working retry', async () => {
    const onRetry = vi.fn();
    renderContent({ error: { status: 500, message: 'Server exploded', fieldErrors: {} }, onRetry });

    expect(screen.getByText('Server exploded')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the no-permission screen for a 403 instead of a retry', () => {
    renderContent({
      error: { status: 403, message: 'Forbidden', fieldErrors: {} },
      onRetry: vi.fn(),
    });

    expect(screen.getByText('No permission')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('reports a sort request only for sortable columns', async () => {
    const onSortChange = vi.fn();
    renderContent({ sortableColumns: ['name'], onSortChange });

    await userEvent.click(screen.getByRole('button', { name: 'Sort by this column' }));

    expect(onSortChange).toHaveBeenCalledWith('name');
    expect(screen.getAllByRole('button', { name: 'Sort by this column' })).toHaveLength(1);
  });

  it('marks the active sort direction for assistive tech', () => {
    renderContent({
      sortableColumns: ['name'],
      sort: { columnId: 'name', direction: 'desc' },
    });

    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });
});

const meta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  current_page: 2,
  from: 16,
  last_page: 4,
  per_page: 15,
  to: 30,
  total: 55,
  ...overrides,
});

describe('DataTable.Pagination', () => {
  it('shows the visible range and moves between pages', async () => {
    const onPageChange = vi.fn();
    renderWithIntl(
      <DataTable.Pagination meta={meta()} onPageChange={onPageChange} onPerPageChange={vi.fn()} />,
    );

    expect(screen.getByText('16–30 of 55')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  });

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = renderWithIntl(
      <DataTable.Pagination
        meta={meta({ current_page: 1 })}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    rerender(
      <DataTable.Pagination
        meta={meta({ current_page: 4 })}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('renders nothing for an empty result set', () => {
    const { container } = renderWithIntl(
      <DataTable.Pagination
        meta={meta({ total: 0, from: null, to: null })}
        onPageChange={vi.fn()}
        onPerPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('DataTable.Toolbar', () => {
  it('shows an active filter and clears it from its chip', async () => {
    const onFilterChange = vi.fn();
    renderWithIntl(
      <DataTable.Toolbar
        searchValue=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search people"
        filters={[
          { id: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }] },
        ]}
        filterValues={{ status: 'active' }}
        onFilterChange={onFilterChange}
      />,
    );

    expect(screen.getByText(/Active/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear Status filter' }));

    expect(onFilterChange).toHaveBeenCalledWith('status', null);
  });

  it('offers "clear filters" only when something is filtered', () => {
    const { rerender } = renderWithIntl(
      <DataTable.Toolbar
        searchValue=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search people"
        onClearAll={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();

    rerender(
      <DataTable.Toolbar
        searchValue="lay"
        onSearchChange={vi.fn()}
        searchPlaceholder="Search people"
        onClearAll={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });
});
