'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@crm/ui';
import {
  Banknote,
  Building,
  Home,
  Images,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Undo2,
  UserRoundSearch,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { useProjectOptions } from '@/features/real-estate/projects';
import { Can } from '@/shared/components/auth/can';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import { DataTable } from '@/shared/components/data-table/data-table';
import {
  createDataTableColumnHelper,
  type FilterDefinition,
} from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { Amount } from '@/shared/components/display/amount';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import { UNIT_DEFAULT_PAGE_SIZE, UNIT_FILTER_IDS } from '../constants';
import { useUnitsQuery } from '../hooks/use-unit-queries';
import { type Unit, UNIT_STATUSES, UNIT_TYPES } from '../types';
import { ReserveUnitDialog } from './reserve-unit-dialog';
import { UnitConfirmDialog, type UnitConfirmKind } from './unit-confirm-dialog';
import { UnitFormDialog } from './unit-form-dialog';
import { UnitInterestsDialog } from './unit-interests-dialog';
import { UnitMediaDialog } from './unit-media-dialog';

const NO_ROWS: Unit[] = [];
const helper = createDataTableColumnHelper<Unit>();

type FormTarget = { unit: Unit | null } | null;
type ConfirmTarget = { unit: Unit; kind: UnitConfirmKind } | null;

interface RowActionsProps {
  unit: Unit;
  onEdit: (unit: Unit) => void;
  onReserve: (unit: Unit) => void;
  onConfirm: (unit: Unit, kind: UnitConfirmKind) => void;
  onInterests: (unit: Unit) => void;
  onMedia: (unit: Unit) => void;
}

function RowActions({ unit, onEdit, onReserve, onConfirm, onInterests, onMedia }: RowActionsProps) {
  const t = useTranslations('units.actions');
  const canManage = useCan(PERMISSIONS.unitsManage);
  const canReserve = useCan(PERMISSIONS.unitsReserve);
  // Anyone who can see units sees who is interested; adding or removing needs "reserve".
  const canSeeInterests = useCan(PERMISSIONS.unitsView);
  const canSeeMedia = useCan(PERMISSIONS.unitMediaView);

  const canReserveNow = canReserve && unit.status === 'available';
  const canRelease = canReserve && unit.status === 'reserved';
  const canSell = canManage && unit.status !== 'sold';
  if (!canManage && !canReserveNow && !canRelease && !canSeeInterests && !canSeeMedia) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`${t('menu')}: ${unit.unit_number}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {canSeeInterests && (
          <DropdownMenuItem onSelect={() => onInterests(unit)}>
            <UserRoundSearch aria-hidden />
            {t('interests')}
          </DropdownMenuItem>
        )}
        {canSeeMedia && (
          <DropdownMenuItem onSelect={() => onMedia(unit)}>
            <Images aria-hidden />
            {t('media')}
          </DropdownMenuItem>
        )}
        {(canSeeInterests || canSeeMedia) && (canReserveNow || canRelease || canSell) && (
          <DropdownMenuSeparator />
        )}
        {canReserveNow && (
          <DropdownMenuItem onSelect={() => onReserve(unit)}>
            <Home aria-hidden />
            {t('reserve')}
          </DropdownMenuItem>
        )}
        {canRelease && (
          <DropdownMenuItem onSelect={() => onConfirm(unit, 'release')}>
            <Undo2 aria-hidden />
            {t('release')}
          </DropdownMenuItem>
        )}
        {canSell && (
          <DropdownMenuItem onSelect={() => onConfirm(unit, 'sell')}>
            <Banknote aria-hidden />
            {t('sell')}
          </DropdownMenuItem>
        )}
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onEdit(unit)}>
              <Pencil aria-hidden />
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onConfirm(unit, 'delete')}>
              <Trash2 aria-hidden />
              {t('delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UnitsPageContent() {
  const t = useTranslations('units');
  const tNav = useTranslations('nav');
  const list = useListParams({
    filterIds: UNIT_FILTER_IDS,
    defaultPerPage: UNIT_DEFAULT_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [reserveTarget, setReserveTarget] = useState<Unit | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [interestsTarget, setInterestsTarget] = useState<Unit | null>(null);
  const [mediaTarget, setMediaTarget] = useState<Unit | null>(null);

  const query = useUnitsQuery({
    search: list.search,
    page: list.page,
    perPage: list.perPage,
    projectId: list.filters.project_id,
    type: list.filters.type,
    status: list.filters.status,
  });

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'project_id',
        label: t('fields.project'),
        icon: Building,
        options: [],
        useOptions: useProjectOptions,
      },
      {
        id: 'type',
        label: t('fields.type'),
        icon: Layers,
        options: UNIT_TYPES.map((value) => ({ value, label: t(`types.${value}`) })),
      },
      {
        id: 'status',
        label: t('fields.status'),
        icon: Home,
        options: UNIT_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'unit',
          header: t('columns.unit'),
          cell: ({ row }) => (
            <div className="min-w-0">
              <span className="block truncate font-semibold">{row.original.unit_number}</span>
              <span className="text-caption text-text-faint">
                {row.original.project.name}
                {row.original.building ? ` · ${row.original.building.name}` : ''}
              </span>
            </div>
          ),
        }),
        helper.display({
          id: 'type',
          header: t('columns.type'),
          cell: ({ row }) => t(`types.${row.original.type}`),
        }),
        helper.display({
          id: 'size',
          header: t('columns.size'),
          cell: ({ row }) => (
            <span className="num">
              {t('sizeValue', {
                area: Number(row.original.area_sqm),
                bedrooms: row.original.bedrooms ?? 0,
              })}
            </span>
          ),
        }),
        helper.display({
          id: 'price',
          header: t('columns.price'),
          cell: ({ row }) => <Amount value={row.original.price} />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`unit_${row.original.status}`} />,
        }),
      ]),
      createActionsColumn<Unit>((unit) => (
        <RowActions
          unit={unit}
          onEdit={(target) => setFormTarget({ unit: target })}
          onReserve={setReserveTarget}
          onConfirm={(target, kind) => setConfirmTarget({ unit: target, kind })}
          onInterests={setInterestsTarget}
          onMedia={setMediaTarget}
        />
      )),
    ],
    [t],
  );

  const isFiltered = list.search !== '' || Object.values(list.filters).some(Boolean);

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.sales') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.unitsManage}>
            <Button onClick={() => setFormTarget({ unit: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      <DataTable>
        <DataTable.Toolbar
          searchValue={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder={t('searchPlaceholder')}
          filters={filters}
          filterValues={list.filters}
          onFilterChange={list.setFilter}
          onClearAll={() => {
            list.setSearch('');
            list.clearFilters();
          }}
        />
        <DataTable.Content
          columns={columns}
          data={query.data?.data ?? NO_ROWS}
          getRowId={(unit) => String(unit.id)}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={() => void query.refetch()}
          emptyState={
            <EmptyState
              icon={Home}
              title={isFiltered ? t('empty.filteredTitle') : t('empty.title')}
              description={isFiltered ? t('empty.filteredDescription') : t('empty.description')}
            />
          }
        />
        <DataTable.Pagination
          meta={query.data?.meta}
          onPageChange={list.setPage}
          onPerPageChange={list.setPerPage}
        />
      </DataTable>

      {formTarget && (
        <UnitFormDialog
          key={formTarget.unit?.id ?? 'new'}
          unit={formTarget.unit}
          onClose={() => setFormTarget(null)}
        />
      )}
      {reserveTarget && (
        <ReserveUnitDialog unit={reserveTarget} onClose={() => setReserveTarget(null)} />
      )}
      {confirmTarget && (
        <UnitConfirmDialog
          unit={confirmTarget.unit}
          kind={confirmTarget.kind}
          onClose={() => setConfirmTarget(null)}
        />
      )}
      {interestsTarget && (
        <UnitInterestsDialog unit={interestsTarget} onClose={() => setInterestsTarget(null)} />
      )}
      {mediaTarget && <UnitMediaDialog unit={mediaTarget} onClose={() => setMediaTarget(null)} />}
    </>
  );
}
