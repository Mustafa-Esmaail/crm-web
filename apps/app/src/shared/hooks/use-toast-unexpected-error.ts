'use client';

import { isApiError } from '@crm/api-client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const VALIDATION_STATUS = 422;

/**
 * Mutation `onError` handler. A 422 belongs on the form fields (or an inline banner), so it is
 * skipped here; anything else has no field to show it, so it becomes a toast.
 */
export function useToastUnexpectedError() {
  const t = useTranslations('errors');

  return (error: unknown) => {
    if (isApiError(error) && error.status === VALIDATION_STATUS) return;
    toast.error(isApiError(error) ? error.message : t('unknown'));
  };
}
