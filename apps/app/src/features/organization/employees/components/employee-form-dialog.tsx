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
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useBranchOptions } from '@/features/organization/branches';
import { useDepartmentLookup, useDepartmentOptions } from '@/features/organization/departments';
import { useTeamLookup } from '@/features/organization/teams';
import { AsyncSelectField } from '@/shared/components/form/async-select-field';
import { DateField } from '@/shared/components/form/date-field';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { NumberField } from '@/shared/components/form/number-field';
import { SelectField } from '@/shared/components/form/select-field';
import { TextField } from '@/shared/components/form/text-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { EMPLOYEE_LOCALES } from '../constants';
import { useSaveEmployee } from '../hooks/use-employee-mutations';
import { useEmployeeOptions } from '../hooks/use-employee-options';
import { createEmployeeSchema, editEmployeeSchema, type EmployeeFormValues } from '../schemas';
import type { Employee } from '../types';
import { EMPTY_EMPLOYEE_FORM, toEmployeeFormValues } from '../utils/mappers';

const EMPLOYEE_FIELDS = Object.keys(EMPTY_EMPLOYEE_FORM);

interface EmployeeFormDialogProps {
  /** The employee being edited, or null to create one. */
  employee: Employee | null;
  onClose: () => void;
}

/** Mount only while open (key by employee): a fresh mount is a fresh form, so no reset effects. */
export function EmployeeFormDialog({ employee, onClose }: EmployeeFormDialogProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveEmployee();
  const branches = useBranchOptions();
  const departments = useDepartmentOptions();
  const departmentLookup = useDepartmentLookup();
  const teams = useTeamLookup();

  const { control, handleSubmit, setError, setValue } = useZodForm(
    employee ? editEmployeeSchema : createEmployeeSchema,
    employee ? toEmployeeFormValues(employee) : EMPTY_EMPLOYEE_FORM,
  );

  // A team sits in one department, which sits in one branch: choosing the team settles both.
  const fillFromTeam = (teamId: string) => {
    const departmentId = teams.teams.find((team) => String(team.id) === teamId)?.department?.id;
    if (departmentId === undefined) return;

    setValue('department_id', String(departmentId));
    const branchId = departmentLookup.get(departmentId)?.branch?.id;
    if (branchId !== undefined) setValue('branch_id', String(branchId));
  };

  const submit = (values: EmployeeFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: employee?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, EMPLOYEE_FIELDS).unmapped);
        },
      },
    );
  };

  const localeOptions = EMPLOYEE_LOCALES.map((value) => ({ value, label: t(`locales.${value}`) }));

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name" label={t('fields.name')} isRequired />
            <TextField
              control={control}
              name="email"
              label={t('fields.email')}
              type="email"
              autoComplete="off"
              isLtr
              isRequired
            />
            <TextField
              control={control}
              name="password"
              label={t('fields.password')}
              type="password"
              autoComplete="new-password"
              description={employee ? t('fields.passwordKeep') : undefined}
              isLtr
              isRequired={!employee}
            />
            <TextField control={control} name="employee_code" label={t('fields.code')} isLtr />
            <TextField control={control} name="phone" label={t('fields.phone')} type="tel" isLtr />
            <TextField control={control} name="job_title" label={t('fields.jobTitle')} />
            <SelectField
              control={control}
              name="team_id"
              label={t('fields.team')}
              options={teams.options}
              noneLabel={t('fields.none')}
              placeholder={t('fields.none')}
              description={t('fields.teamHint')}
              onValueChange={fillFromTeam}
            />
            <SelectField
              control={control}
              name="department_id"
              label={t('fields.department')}
              options={departments.options}
              noneLabel={t('fields.none')}
              placeholder={t('fields.none')}
            />
            <SelectField
              control={control}
              name="branch_id"
              label={t('fields.branch')}
              options={branches.options}
              noneLabel={t('fields.none')}
              placeholder={t('fields.none')}
            />
            <AsyncSelectField
              control={control}
              name="manager_id"
              label={t('fields.manager')}
              useOptions={useEmployeeOptions}
              initialOption={
                employee?.manager
                  ? { value: String(employee.manager.id), label: employee.manager.name }
                  : null
              }
            />
            <DateField control={control} name="hired_at" label={t('fields.hiredAt')} />
            <NumberField
              control={control}
              name="commission_rate"
              label={t('fields.commissionRate')}
              min={0}
              max={100}
              step={0.1}
            />
            <SelectField
              control={control}
              name="locale"
              label={t('fields.language')}
              options={localeOptions}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
