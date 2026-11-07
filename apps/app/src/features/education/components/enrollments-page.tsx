'use client';

import { Button } from '@crm/ui';
import { CircleDot, ClipboardList, GraduationCap, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { INDUSTRIES } from '@/config/industries';
import { PERMISSIONS } from '@/config/permissions';
import { LeadLink } from '@/features/sales/leads';
import { createActionsColumn } from '@/shared/components/data-table/columns';
import {
  createDataTableColumnHelper,
  type FilterDefinition,
} from '@/shared/components/data-table/types';
import { useListParams } from '@/shared/components/data-table/use-list-params';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StatusBadge } from '@/shared/components/display/status-badge';
import { DeleteRecordDialog } from '@/shared/components/feedback/delete-record-dialog';
import { ListPage } from '@/shared/components/layout/list-page';
import { useCan } from '@/shared/hooks/use-can';
import { useHasIndustry } from '@/shared/hooks/use-industry';

import { EDUCATION_PAGE_SIZE, ENROLLMENT_FILTER_IDS } from '../constants';
import { useDeleteEnrollment } from '../hooks/use-education-mutations';
import { useCourseOptions, useEnrollmentsQuery } from '../hooks/use-education-queries';
import { type Enrollment, ENROLLMENT_STATUSES } from '../types';
import { EnrollmentFormDialog } from './enrollment-form-dialog';

const NO_ROWS: Enrollment[] = [];
const helper = createDataTableColumnHelper<Enrollment>();

export function EnrollmentsPage() {
  const t = useTranslations('education.enrollments');
  const tNav = useTranslations('nav');
  const isEducation = useHasIndustry(INDUSTRIES.education);
  const canView = useCan(PERMISSIONS.educationEnrollmentsView) && isEducation;
  const canManage = useCan(PERMISSIONS.educationEnrollmentsManage) && isEducation;
  const list = useListParams({
    filterIds: ENROLLMENT_FILTER_IDS,
    defaultPerPage: EDUCATION_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<{ enrollment: Enrollment | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const remove = useDeleteEnrollment();

  const query = useEnrollmentsQuery(
    {
      page: list.page,
      perPage: list.perPage,
      filters: { status: list.filters.status, course_id: list.filters.course_id },
    },
    canView,
  );

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('fields.status'),
        icon: CircleDot,
        options: ENROLLMENT_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
      {
        id: 'course_id',
        label: t('fields.course'),
        icon: GraduationCap,
        options: [],
        useOptions: useCourseOptions,
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'lead',
          header: t('columns.lead'),
          cell: ({ row }) => <LeadLink id={row.original.lead_id} />,
        }),
        helper.display({
          id: 'course',
          header: t('columns.course'),
          cell: ({ row }) => (
            <span className="block truncate font-semibold">{row.original.course?.name ?? '—'}</span>
          ),
        }),
        helper.display({
          id: 'enrolled_on',
          header: t('columns.enrolledOn'),
          cell: ({ row }) => <FormattedDate value={row.original.enrolled_on} pattern="PP" />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`enrollment_${row.original.status}`} />,
        }),
      ]),
      ...(canManage
        ? [
            createActionsColumn<Enrollment>((enrollment) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')} #${enrollment.id}`}
                  onClick={() => setFormTarget({ enrollment })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')} #${enrollment.id}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(enrollment);
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

  const isFiltered = Object.values(list.filters).some(Boolean);

  return (
    <ListPage
      title={t('title')}
      description={t('description')}
      sectionLabel={tNav('sections.sales')}
      canView={canView}
      create={
        canManage
          ? { label: t('actions.create'), onClick: () => setFormTarget({ enrollment: null }) }
          : undefined
      }
      filters={filters}
      filterValues={list.filters}
      onFilterChange={list.setFilter}
      onClearAll={list.clearFilters}
      columns={columns}
      rows={query.data?.data ?? NO_ROWS}
      getRowId={(enrollment) => String(enrollment.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: ClipboardList,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <EnrollmentFormDialog
          key={formTarget.enrollment?.id ?? 'new'}
          enrollment={formTarget.enrollment}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteRecordDialog
          title={t('delete.title')}
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
