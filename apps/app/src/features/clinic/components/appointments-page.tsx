'use client';

import { Button } from '@crm/ui';
import { CalendarClock, CircleDot, Pencil, Stethoscope, Trash2, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { INDUSTRIES } from '@/config/industries';
import { PERMISSIONS } from '@/config/permissions';
import { useEmployeeName, useEmployeeOptions } from '@/features/organization/employees';
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

import { APPOINTMENT_FILTER_IDS, CLINIC_PAGE_SIZE } from '../constants';
import { useDeleteAppointment } from '../hooks/use-clinic-mutations';
import { useAppointmentsQuery, useServiceOptions } from '../hooks/use-clinic-queries';
import { type Appointment, APPOINTMENT_STATUSES } from '../types';
import { AppointmentFormDialog } from './appointment-form-dialog';

const NO_ROWS: Appointment[] = [];
const helper = createDataTableColumnHelper<Appointment>();

function DoctorName({ id }: { id: number }) {
  return <span className="block truncate">{useEmployeeName(String(id)) ?? `#${id}`}</span>;
}

export function AppointmentsPage() {
  const t = useTranslations('clinic.appointments');
  const tNav = useTranslations('nav');
  const isClinic = useHasIndustry(INDUSTRIES.clinic);
  const canView = useCan(PERMISSIONS.clinicAppointmentsView) && isClinic;
  const canManage = useCan(PERMISSIONS.clinicAppointmentsManage) && isClinic;
  const list = useListParams({
    filterIds: APPOINTMENT_FILTER_IDS,
    defaultPerPage: CLINIC_PAGE_SIZE,
  });
  const [formTarget, setFormTarget] = useState<{ appointment: Appointment | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const remove = useDeleteAppointment();

  const query = useAppointmentsQuery(
    {
      page: list.page,
      perPage: list.perPage,
      filters: {
        status: list.filters.status,
        service_id: list.filters.service_id,
        doctor_id: list.filters.doctor_id,
      },
    },
    canView,
  );

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('fields.status'),
        icon: CircleDot,
        options: APPOINTMENT_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
      },
      {
        id: 'service_id',
        label: t('fields.service'),
        icon: Stethoscope,
        options: [],
        useOptions: useServiceOptions,
      },
      {
        id: 'doctor_id',
        label: t('fields.doctor'),
        icon: UserRound,
        options: [],
        useOptions: useEmployeeOptions,
        useSelectedLabel: useEmployeeName,
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      ...helper.columns([
        helper.display({
          id: 'when',
          header: t('columns.when'),
          cell: ({ row }) => (
            <span className="num whitespace-nowrap">
              <FormattedDate value={row.original.starts_at} pattern="PPp" />
            </span>
          ),
        }),
        helper.display({
          id: 'service',
          header: t('columns.service'),
          cell: ({ row }) => (
            <span className="block truncate font-semibold">
              {row.original.service?.name ?? '—'}
            </span>
          ),
        }),
        helper.display({
          id: 'lead',
          header: t('columns.lead'),
          cell: ({ row }) => <LeadLink id={row.original.lead_id} />,
        }),
        helper.display({
          id: 'doctor',
          header: t('columns.doctor'),
          cell: ({ row }) => <DoctorName id={row.original.doctor_id} />,
        }),
        helper.display({
          id: 'status',
          header: t('columns.status'),
          cell: ({ row }) => <StatusBadge status={`booking_${row.original.status}`} />,
        }),
      ]),
      ...(canManage
        ? [
            createActionsColumn<Appointment>((appointment) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.edit')} #${appointment.id}`}
                  onClick={() => setFormTarget({ appointment })}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t('actions.delete')} #${appointment.id}`}
                  onClick={() => {
                    remove.reset();
                    setDeleteTarget(appointment);
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
          ? { label: t('actions.create'), onClick: () => setFormTarget({ appointment: null }) }
          : undefined
      }
      filters={filters}
      filterValues={list.filters}
      onFilterChange={list.setFilter}
      onClearAll={list.clearFilters}
      columns={columns}
      rows={query.data?.data ?? NO_ROWS}
      getRowId={(appointment) => String(appointment.id)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      meta={query.data?.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      empty={{
        icon: CalendarClock,
        title: isFiltered ? t('empty.filteredTitle') : t('empty.title'),
        description: isFiltered ? t('empty.filteredDescription') : t('empty.description'),
      }}
    >
      {formTarget && (
        <AppointmentFormDialog
          key={formTarget.appointment?.id ?? 'new'}
          appointment={formTarget.appointment}
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
