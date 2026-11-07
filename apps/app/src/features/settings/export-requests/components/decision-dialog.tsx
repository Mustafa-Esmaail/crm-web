'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@crm/ui';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { emptyToNull } from '@/lib/utils/strings';

import { useDecideExport } from '../hooks/use-export-requests';
import type { ExportRequest } from '../types';

interface DecisionDialogProps {
  request: ExportRequest;
  decision: 'approve' | 'reject';
  onClose: () => void;
}

export function DecisionDialog({ request, decision, onClose }: DecisionDialogProps) {
  const t = useTranslations('exportRequests.decision');
  const tCommon = useTranslations('common');
  const [note, setNote] = useState('');
  const decide = useDecideExport();

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && !decide.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t(`${decision}.title`, { name: request.requested_by?.name ?? '—' })}
          </DialogTitle>
          <DialogDescription>{t(`${decision}.description`)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="export-note" className="text-small font-medium">
            {t('note')} <span className="text-text-faint">({tCommon('optional')})</span>
          </label>
          <Textarea
            id="export-note"
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={decide.isPending}>
            {tCommon('cancel')}
          </Button>
          <Button
            variant={decision === 'reject' ? 'destructive' : 'default'}
            disabled={decide.isPending}
            onClick={() =>
              decide.mutate(
                { id: request.id, decision, note: emptyToNull(note) },
                { onSuccess: onClose },
              )
            }
          >
            {decide.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {t(`${decision}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
