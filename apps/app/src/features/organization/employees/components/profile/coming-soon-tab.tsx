'use client';

import { Card } from '@crm/ui';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/shared/components/feedback/empty-state';

interface ComingSoonTabProps {
  /** Key inside `employees.profile.comingSoon`. */
  messageKey: 'deals' | 'roles';
  icon: LucideIcon;
}

/** Tabs whose module does not exist yet keep their place in the layout and say what is coming. */
export function ComingSoonTab({ messageKey, icon }: ComingSoonTabProps) {
  const t = useTranslations(`employees.profile.comingSoon.${messageKey}`);

  return (
    <Card>
      <EmptyState icon={icon} title={t('title')} description={t('description')} />
    </Card>
  );
}
