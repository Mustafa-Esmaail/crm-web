'use client';

import { Button } from '@crm/ui';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FormAlert } from '@/shared/components/form/form-alert';

interface SaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  /** Messages the API refused the save with (a 422), shown above the buttons. */
  errors: string[];
  onSave: () => void;
  onDiscard: () => void;
}

/** Sticky footer shared by the three role tabs: each edits a draft and saves it as one request. */
export function SaveBar({ isDirty, isSaving, errors, onSave, onDiscard }: SaveBarProps) {
  const t = useTranslations('roles.editor');

  return (
    <div className="bg-card sticky bottom-0 z-10 -mx-4 mt-6 space-y-2 border-t px-4 py-3 lg:-mx-7 lg:px-7">
      <FormAlert messages={errors} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-small text-muted-foreground">{isDirty ? t('unsaved') : t('saved')}</p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!isDirty || isSaving} onClick={onDiscard}>
            {t('discard')}
          </Button>
          <Button disabled={!isDirty || isSaving} onClick={onSave}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden />}
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
