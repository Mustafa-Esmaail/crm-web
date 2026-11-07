import { ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from './empty-state';

export function NoPermission({ className }: { className?: string }) {
  const t = useTranslations('feedback.noPermission');

  return (
    <EmptyState
      icon={ShieldAlert}
      title={t('title')}
      description={t('description')}
      className={className}
    />
  );
}
