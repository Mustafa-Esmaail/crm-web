'use client';

import { isApiError } from '@crm/api-client';
import { Button } from '@crm/ui';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from './empty-state';
import { NoPermission } from './no-permission';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const t = useTranslations('feedback.error');

  // 403 is not a failure to retry; it is a decision, so it gets its own screen.
  if (isApiError(error) && error.status === 403) return <NoPermission className={className} />;

  const message = isApiError(error) ? error.message : t('description');

  return (
    <EmptyState icon={TriangleAlert} title={t('title')} description={message} className={className}>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden />
          {t('retry')}
        </Button>
      )}
    </EmptyState>
  );
}
