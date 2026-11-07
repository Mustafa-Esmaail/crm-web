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

import { useTeamLookup } from '@/features/organization/teams';
import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { SwitchField } from '@/shared/components/form/switch-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useSaveRule } from '../hooks/use-pipeline';
import { ruleFormSchema, type RuleFormValues } from '../schemas';
import { DISTRIBUTION_STRATEGIES, type DistributionRule } from '../types';
import { EMPTY_RULE_FORM, toRuleFormValues } from '../utils/mappers';

const RULE_FIELDS = Object.keys(EMPTY_RULE_FORM);

interface RuleFormDialogProps {
  rule: DistributionRule | null;
  onClose: () => void;
}

export function RuleFormDialog({ rule, onClose }: RuleFormDialogProps) {
  const t = useTranslations('pipelineSettings');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const save = useSaveRule();
  const teams = useTeamLookup();

  const { control, handleSubmit, setError } = useZodForm(
    ruleFormSchema,
    rule ? toRuleFormValues(rule) : EMPTY_RULE_FORM,
  );

  const submit = (values: RuleFormValues) => {
    setAlertMessages([]);
    save.mutate(
      { id: rule?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, RULE_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !save.isPending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(`kinds.rules.${rule ? 'edit' : 'create'}`)}</DialogTitle>
          <DialogDescription>{t('rules.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <SelectField
            control={control}
            name="team_id"
            label={t('fields.team')}
            isRequired
            options={teams.options}
          />
          <SelectField
            control={control}
            name="strategy"
            label={t('fields.strategy')}
            options={DISTRIBUTION_STRATEGIES.map((value) => ({
              value,
              label: t(`strategies.${value}`),
            }))}
          />
          <SwitchField control={control} name="is_active" label={t('fields.isActive')} />

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
