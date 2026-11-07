'use client';

import { Button } from '@crm/ui';
import { CircleCheck, GraduationCap, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { INDUSTRIES } from '@/config/industries';
import { PERMISSIONS } from '@/config/permissions';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type FilterDefinition,
} from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { Amount } from '@/shared/components/display/amount';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { DeleteRecordDialog } from '@/shared/components/feedback/delete-record-dialog';
import { ListPage } from '@/shared/components/layout/list-page';
import { useCan } from '@/shared/hooks/use-can';
import { useHasIndustry } from '@/shared/hooks/use-industry';

import { COURSE_FILTER_IDS, EDUCATION_PAGE_SIZE } from '../constants';
import { useDeleteCourse } from '../hooks/use-education-mutations';
import { useCoursesQuery } from '../hooks/use-education-queries';
import type { Course } from '../types';
import { seatsLabel } from '../utils/mappers';
import { CourseFormDialog } from './course-form-dialog';

const NO_ROWS: Course[] = [];
const helper = createDataTableColumnHelper<Course>();

export function CoursesPage() {
  const t = useTranslations('education.courses');
  const tNav = useTranslations('nav');
  const isEducation = useHasIndustry(INDUSTRIES.education);
  const canView = useCan(PERMISSIONS.educationCoursesView) && isEducation;
  const canManage = useCan(PERMISSIONS.educationCoursesManage) && isEducation;
  const list = useListParams({ filterIds: COURSE_FILTER_IDS, defaultPerPage: EDUCATION_PAGE_SIZE });
  const [formTarget, setFormTarget] = useState<{ course: Course | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const remove = useDeleteCourse();

  const query = useCoursesQuery(
    {
      search: list.search,
      page: list.page,
      perPage: list.perPage,
      filters: { is_active: list.filters.is_active },
    },
    canView,
  );

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'is_active',
        label: t('fields.isActive'),
        icon: CircleCheck,
        options: [
          { value: '1', label: t('active') },
          { value: '0', label: t('inactive') },
        ],
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'name',
          header: t('columns.course'),
          cell: ({ row }) => (
            <div className="min-w-0">
              <span className="block truncate font-semibold">{row.original.name}</span>
              {row.original.code && (
                <span className="text-caption text-text-faint">{row.original.code}</span>
              )}
            </div>
          ),
        }),
        helper.display({
          id: 'dates',
          header: t('columns.dates'),
          cell: ({ row }) => (
            <span className="whitespace-nowrap">
              <FormattedDate value={row.original.starts_on} pattern="PP" />
              {' – '}
              <FormattedDate value={row.original.ends_on} pattern="PP" />
            </span>
          ),
        }),
        helper.display({
          id: 'seats',
          header: t('columns.seats'),
          cell: ({ row }) => <span className="num">{seatsLabel(row.original)}</span>,
        }),
        helper.display({
          id: 'fee',
          header: t('columns.fee'),
          cell: ({ row }) => <Amount value={row.original.fee} />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => (
            <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} />
          ),
        }),
      ]),
      ...(canManage
        ? [
            createActionsColumn<Course>((course) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')}: ${course.name}`}
                  onClick={() => setFormTarget({ course })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')}: ${course.name}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(course);
                  }}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            )),
          ]
        : []),
    ],
    [t, canManage, remove],
  );

  const isFiltered = list.search !== '' || Object.values(list.filters).some(Boolean);

  return (
    <ListPage
      title={t('title')}
      description={t('description')}
      sectionLabel={tNav('sections.sales')}
      canView={canView}
      create={
        canManage
          ? { label: t('actions.create'), onClick: () => setFormTarget({ course: null }) }
          : undefined
      }
      search={{ value: list.search, onChange: list.setSearch, placeholder: t('searchPlaceholder') }}
      filters={filters}
      filterValues={list.filters}
      onFilterChange={list.setFilter}
      onClearAll={() => {
        list.setSearch('');
        list.clearFilters();
      }}
      columns={columns}
      rows={query.data?.data ?? NO_ROWS}
      getRowId={(course) => String(course.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: GraduationCap,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <CourseFormDialog
          key={formTarget.course?.id ?? 'new'}
          course={formTarget.course}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRecordDialog
          title={t('delete.title', { name: deleteTarget.name })}
          description={t('delete.description')}
          confirmLabel={t('delete.confirm')}
          isPending={remove.isPending}
          error={remove.error}
          onConfirm={() =>
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          }
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </ListPage>
  );
}
