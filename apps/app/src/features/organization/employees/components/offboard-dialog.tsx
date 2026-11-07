'use client';

import { isApiError } from '@crm/api-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@crm/ui';
import { Loader2, LogOut, Scroll, Target, UserRound, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useTeamLookup } from '@/features/organization/teams';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useOffboardEmployee } from '../hooks/use-employee-mutations';
import { useEmployeeOptions } from '../hooks/use-employee-options';
import { useEmployeeQuery } from '../hooks/use-employee-queries';
import { offboardSchema, type OffboardValues } from '../schemas';
import type { Employee } from '../types';

const OFFBOARD_FIELDS = ['reassign_to', 'reason'];

interface OffboardDialogProps {
  employee: Employee;
  onClose: () => void;
}

/** What leaves with the person: reports, the teams they lead, and (soon) their leads and deals. */
function TransferSummary({ employee }: { employee: Employee }) {
  const t = useTranslations('employees.offboard.summary');
  const detail = useEmployeeQuery(employee.id);
  const teams = useTeamLookup();

  const reports = detail.data?.direct_reports_count ?? 0;
  const ledTeams = teams.teams.filter((team) => team.leader?.id === employee.id);

  return (
    <div className="bg-surface-2 space-y-2 rounded-lg border p-4">
      <p className="text-small font-semibold">{t('title')}</p>
      <ul className="text-small text-secondary-foreground space-y-2">
        <li className="flex items-center gap-2">
          <UserRound className="text-muted-foreground size-4" aria-hidden />
          {t('reports', { count: reports })}
        </li>
        {ledTeams.map((team) => (
          <li key={team.id} className="flex items-center gap-2">
            <UsersRound className="text-muted-foreground size-4" aria-hidden />
            {t('leadsTeam', { team: team.name })}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <Target className="text-muted-foreground size-4" aria-hidden />
          <span className="flex-1">{t('leadsAndDeals')}</span>
          <span className="text-caption text-muted-foreground bg-card rounded-md border px-2 py-0.5">
            {t('soon')}
          </span>
        </li>
      </ul>
    </div>
  );
}

export function OffboardDialog({ employee, onClose }: OffboardDialogProps) {
  const t = useTranslations('employees.offboard');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const offboard = useOffboardEmployee();

  const { control, handleSubmit, setError } = useZodForm(offboardSchema, {
    reassign_to: '',
    reason: '',
  });

  // The person leaving cannot be their own replacement, so they are left out of the picker.
  function useSuccessors(search: string) {
    return useEmployeeOptions(search, employee.id);
  }

  const submit = (values: OffboardValues) => {
    setAlertMessages([]);
    offboard.mutate(
      { id: employee.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, OFFBOARD_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !offboard.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-lg">
        <DialogHeader className="flex-row items-start gap-3">
          <span className="bg-destructive-soft text-destructive flex size-10 shrink-0 items-center justify-center rounded-md">
            <LogOut className="size-5 rtl:rotate-180" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="space-y-1 text-start">
            <DialogTitle>{t('title', { name: employee.name })}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <TransferSummary employee={employee} />
          <AsyncSelectField
            control={control}
            name="reassign_to"
            label={t('transferTo')}
            useOptions={useSuccessors}
            placeholder={t('transferPlaceholder')}
          />
          <TextareaField
            control={control}
            name="reason"
            label={`${t('reason')} (${tCommon('optional')})`}
            placeholder={t('reasonPlaceholder')}
          />
          <p className="text-caption text-muted-foreground flex items-center gap-2">
            <Scroll className="size-3.5" aria-hidden />
            {t('loggedNote')}
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={offboard.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" variant="destructive" disabled={offboard.isPending}>
              {offboard.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
