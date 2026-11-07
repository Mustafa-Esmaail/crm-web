'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@crm/ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { FormattedDate } from '@/shared/components/display/formatted-date';
import { RelativeTime } from '@/shared/components/display/relative-time';

import type { Employee } from '../../types';

const EMPTY = '—';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-4 py-2.5">
      <dt className="text-small text-muted-foreground">{label}</dt>
      <dd className="text-small text-foreground font-medium">{children}</dd>
    </div>
  );
}

/** Email, phone and codes are always left-to-right, whatever the page language. */
function Ltr({ children }: { children: ReactNode }) {
  return (
    <bdi dir="ltr" className="num">
      {children}
    </bdi>
  );
}

export function BasicInfoCard({ employee }: { employee: Employee }) {
  const t = useTranslations('employees.profile.basic');
  const tLocales = useTranslations('employees.locales');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          <Row label={t('code')}>
            {employee.employee_code ? <Ltr>{employee.employee_code}</Ltr> : EMPTY}
          </Row>
          <Row label={t('email')}>{employee.email ? <Ltr>{employee.email}</Ltr> : EMPTY}</Row>
          <Row label={t('phone')}>{employee.phone ? <Ltr>{employee.phone}</Ltr> : EMPTY}</Row>
          <Row label={t('hiredAt')}>
            <FormattedDate value={employee.hired_at} />
          </Row>
          <Row label={t('commission')}>
            {employee.commission_rate === null || employee.commission_rate === undefined ? (
              EMPTY
            ) : (
              <span className="num">{Number(employee.commission_rate)}%</span>
            )}
          </Row>
          <Row label={t('language')}>
            {employee.locale === 'en' ? tLocales('en') : tLocales('ar')}
          </Row>
          <Row label={t('lastLogin')}>
            <RelativeTime value={employee.last_login_at} fallback={t('never')} />
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
