'use client';

import { Button, Card } from '@crm/ui';
import { ArrowRightLeft, Pencil, Trash2, UserRoundCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { useLeadName } from '@/features/sales/leads';
import { RelatedTasks } from '@/features/sales/tasks';
import { useRouter } from '@/lib/i18n/navigation';
import { Link } from '@/lib/i18n/navigation';
import { Can } from '@/shared/components/auth/can';
import { Amount } from '@/shared/components/display/amount';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StageBadge } from '@/shared/components/display/stage-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { PageSkeleton } from '@/shared/components/feedback/page-skeleton';
import { PageHeader } from '@/shared/components/layout/page-header';

import { useDealQuery } from '../hooks/use-deal-queries';
import type { Deal } from '../types';
import { DealAssignDialog } from './deal-assign-dialog';
import { DealFormDialog } from './deal-form-dialog';
import { DealStageDialog } from './deal-stage-dialog';
import { DeleteDealDialog } from './delete-deal-dialog';

const EMPTY = '—';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-2.5">
      <dt className="text-small text-muted-foreground">{label}</dt>
      <dd className="text-small text-foreground min-w-0 font-medium break-words">{children}</dd>
    </div>
  );
}

type DialogKind = 'edit' | 'stage' | 'assign' | 'delete' | null;

export function DealDetail({ id }: { id: number }) {
  const t = useTranslations('deals');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const query = useDealQuery(id);
  const [dialog, setDialog] = useState<DialogKind>(null);

  if (query.isPending) return <PageSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const deal = query.data;
  const close = () => setDialog(null);

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.sales') },
              { label: t('title'), href: '/deals' },
              { label: deal.title },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <PageHeader.Title>{deal.title}</PageHeader.Title>
            {deal.stage && <StageBadge name={deal.stage.name} color={deal.stage.color} />}
          </div>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.dealsUpdate}>
            <Button variant="outline" onClick={() => setDialog('stage')}>
              <ArrowRightLeft aria-hidden />
              {t('actions.changeStage')}
            </Button>
            <Button variant="outline" onClick={() => setDialog('edit')}>
              <Pencil aria-hidden />
              {t('actions.edit')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.dealsAssign}>
            <Button variant="outline" onClick={() => setDialog('assign')}>
              <UserRoundCheck aria-hidden />
              {t('actions.assign')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.dealsDelete}>
            <Button variant="outline" onClick={() => setDialog('delete')}>
              <Trash2 aria-hidden />
              {t('actions.delete')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <DealInfoCard deal={deal} />
        <RelatedTasks relation={{ type: 'deal', id: deal.id }} />
      </div>

      {dialog === 'edit' && <DealFormDialog deal={deal} onClose={close} />}
      {dialog === 'stage' && <DealStageDialog deal={deal} onClose={close} />}
      {dialog === 'assign' && <DealAssignDialog deal={deal} onClose={close} />}
      {dialog === 'delete' && (
        <DeleteDealDialog deal={deal} onClose={close} onDeleted={() => router.replace('/deals')} />
      )}
    </>
  );
}

function DealInfoCard({ deal }: { deal: Deal }) {
  const t = useTranslations('deals.info');
  const leadName = useLeadName(deal.lead_id);

  return (
    <Card className="h-fit gap-0 py-4">
      <h2 className="text-card-title text-foreground px-5 pb-2 font-semibold">{t('title')}</h2>
      <dl className="divide-y px-5">
        <Row label={t('value')}>
          <Amount value={deal.value} />
        </Row>
        <Row label={t('commission')}>
          <Amount value={deal.commission_amount} />
        </Row>
        <Row label={t('lead')}>
          {deal.lead_id ? (
            <Link href={`/leads/${deal.lead_id}`} className="text-primary hover:underline">
              {leadName ?? `#${deal.lead_id}`}
            </Link>
          ) : (
            EMPTY
          )}
        </Row>
        <Row label={t('owner')}>
          {deal.owner ? (
            <span className="inline-flex items-center gap-2">
              <UserAvatar id={deal.owner.id} name={deal.owner.name} size="sm" />
              {deal.owner.name}
            </span>
          ) : (
            <span className="text-text-faint">{t('unassigned')}</span>
          )}
        </Row>
        <Row label={t('expectedClose')}>
          <FormattedDate value={deal.expected_close_date} />
        </Row>
        {deal.closed_at && (
          <Row label={t('closedAt')}>
            <FormattedDate value={deal.closed_at} />
          </Row>
        )}
        <Row label={t('created')}>
          <FormattedDate value={deal.created_at} />
        </Row>
        {deal.lost_reason && <Row label={t('lostReason')}>{deal.lost_reason}</Row>}
      </dl>
      {deal.notes && (
        <div className="mt-2 border-t px-5 pt-3">
          <p className="text-small text-muted-foreground mb-1">{t('notes')}</p>
          <p className="text-small text-secondary-foreground whitespace-pre-wrap">{deal.notes}</p>
        </div>
      )}
    </Card>
  );
}
