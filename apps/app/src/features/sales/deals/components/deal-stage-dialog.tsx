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
import { useWatch } from 'react-hook-form';

import { FormAlert } from '@/shared/components/form/form-alert';
import { mapLaravelErrorsToForm } from '@/shared/components/form/map-laravel-errors';
import { SelectField } from '@/shared/components/form/select-field';
import { TextareaField } from '@/shared/components/form/textarea-field';
import { useZodForm } from '@/shared/components/form/use-zod-form';

import { useChangeDealStage } from '../hooks/use-deal-mutations';
import { useDealPipeline } from '../hooks/use-deal-queries';
import { dealStageChangeSchema, type DealStageChangeValues } from '../schemas';
import type { Deal } from '../types';
import { getDealMoveTargets, toDealStagePayload } from '../utils/mappers';

const STAGE_FIELDS = ['stage_id', 'lost_reason'];

interface DealStageDialogProps {
  deal: Deal;
  onClose: () => void;
}

export function DealStageDialog({ deal, onClose }: DealStageDialogProps) {
  const t = useTranslations('deals.stage');
  const tCommon = useTranslations('common');
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const pipeline = useDealPipeline();
  const change = useChangeDealStage();

  const { control, handleSubmit, setError } = useZodForm(dealStageChangeSchema, {
    stage_id: '',
    lost_reason: '',
  });
  const targets = getDealMoveTargets(deal, pipeline.data ?? []);
  const chosenId = useWatch({ control, name: 'stage_id' });
  const needsReason = targets.find((stage) => String(stage.id) === chosenId)?.is_lost ?? false;

  const submit = (values: DealStageChangeValues) => {
    setAlertMessages([]);
    const payload = toDealStagePayload(values, pipeline.data ?? []);

    change.mutate(
      { id: deal.id, stageId: payload.stage_id, lostReason: payload.lost_reason },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!isApiError(error)) return;
          setAlertMessages(mapLaravelErrorsToForm(error, setError, STAGE_FIELDS).unmapped);
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !change.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title', { name: deal.title })}</DialogTitle>
          <DialogDescription>
            {deal.stage ? t('current', { stage: deal.stage.name }) : t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormAlert messages={alertMessages} />
          <SelectField
            control={control}
            name="stage_id"
            label={t('target')}
            placeholder={t('choose')}
            options={targets.map((stage) => ({ value: String(stage.id), label: stage.name }))}
            isRequired
          />
          {needsReason && (
            <TextareaField
              control={control}
              name="lost_reason"
              label={t('lostReason')}
              description={t('lostReasonHint')}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={change.isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={change.isPending}>
              {change.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
