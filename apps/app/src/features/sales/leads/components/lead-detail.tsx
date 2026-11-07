'use client';

import { Button, Card } from '@crm/ui';
import { ArrowRightLeft, Pencil, Trash2, UserRoundCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { RelatedTasks } from '@/features/sales/tasks';
import { useRouter } from '@/lib/i18n/navigation';
import { Can } from '@/shared/components/auth/can';
import { Amount } from '@/shared/components/display/amount';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StageBadge } from '@/shared/components/display/stage-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { PageSkeleton } from '@/shared/components/feedback/page-skeleton';
import { PageHeader } from '@/shared/components/layout/page-header';

import { useLeadQuery } from '../hooks/use-lead-queries';
import type { Lead } from '../types';
import { ActivityTimeline } from './activity-timeline';
import { AssignLeadsDialog } from './assign-leads-dialog';
import { ChangeStageDialog } from './change-stage-dialog';
import { DeleteLeadDialog } from './delete-lead-dialog';
import { LeadFormDialog } from './lead-form-dialog';
import { LeadMessages } from './lead-messages';

const EMPTY = '—';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 py-2.5">
      <dt className="text-small text-muted-foreground">{label}</dt>
      <dd className="text-small text-foreground min-w-0 font-medium break-words">{children}</dd>
    </div>
  );
}

function Ltr({ children }: { children: ReactNode }) {
  return (
    <bdi dir="ltr" className="num">
      {children}
    </bdi>
  );
}

type Dialog = 'edit' | 'stage' | 'assign' | 'delete' | null;

export function LeadDetail({ id }: { id: number }) {
  const t = useTranslations('leads');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const query = useLeadQuery(id);
  const [dialog, setDialog] = useState<Dialog>(null);

  if (query.isPending) return <PageSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const lead = query.data;

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.sales') },
              { label: t('title'), href: '/leads' },
              { label: lead.name },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <PageHeader.Title>{lead.name}</PageHeader.Title>
            {lead.stage && <StageBadge name={lead.stage.name} color={lead.stage.color} />}
          </div>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.leadsUpdate}>
            <Button variant="outline" onClick={() => setDialog('stage')}>
              <ArrowRightLeft aria-hidden />
              {t('actions.changeStage')}
            </Button>
            <Button variant="outline" onClick={() => setDialog('edit')}>
              <Pencil aria-hidden />
              {t('actions.edit')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.leadsAssign}>
            <Button variant="outline" onClick={() => setDialog('assign')}>
              <UserRoundCheck aria-hidden />
              {t('actions.assign')}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.leadsDelete}>
            <Button variant="outline" onClick={() => setDialog('delete')}>
              <Trash2 aria-hidden />
              {t('actions.delete')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="space-y-4">
          <LeadInfoCard lead={lead} />
          <RelatedTasks relation={{ type: 'lead', id: lead.id }} />
        </div>
        <div className="space-y-4">
          <LeadMessages leadId={lead.id} />
          <ActivityTimeline leadId={lead.id} />
        </div>
      </div>

      {dialog === 'edit' && <LeadFormDialog lead={lead} onClose={() => setDialog(null)} />}
      {dialog === 'stage' && <ChangeStageDialog lead={lead} onClose={() => setDialog(null)} />}
      {dialog === 'assign' && (
        <AssignLeadsDialog
          leadIds={[lead.id]}
          leadName={lead.name}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'delete' && (
        <DeleteLeadDialog
          lead={lead}
          onClose={() => setDialog(null)}
          onDeleted={() => router.replace('/leads')}
        />
      )}
    </>
  );
}

function LeadInfoCard({ lead }: { lead: Lead }) {
  const t = useTranslations('leads.info');

  return (
    <Card className="h-fit gap-0 py-4">
      <h2 className="text-card-title text-foreground px-5 pb-2 font-semibold">{t('title')}</h2>
      <dl className="divide-y px-5">
        <Row label={t('phone')}>{lead.phone ? <Ltr>{lead.phone}</Ltr> : EMPTY}</Row>
        <Row label={t('email')}>{lead.email ? <Ltr>{lead.email}</Ltr> : EMPTY}</Row>
        <Row label={t('budget')}>
          <Amount value={lead.budget} />
        </Row>
        <Row label={t('source')}>{lead.source?.name ?? EMPTY}</Row>
        <Row label={t('owner')}>
          {lead.owner ? (
            <span className="inline-flex items-center gap-2">
              <UserAvatar id={lead.owner.id} name={lead.owner.name} size="sm" />
              {lead.owner.name}
            </span>
          ) : (
            <span className="text-text-faint">{t('unassigned')}</span>
          )}
        </Row>
        <Row label={t('team')}>{lead.team?.name ?? EMPTY}</Row>
        <Row label={t('created')}>
          <FormattedDate value={lead.created_at} />
        </Row>
        {lead.lost_reason && <Row label={t('lostReason')}>{lead.lost_reason}</Row>}
      </dl>
      {lead.notes && (
        <div className="mt-2 border-t px-5 pt-3">
          <p className="text-small text-muted-foreground mb-1">{t('notes')}</p>
          <p className="text-small text-secondary-foreground whitespace-pre-wrap">{lead.notes}</p>
        </div>
      )}
    </Card>
  );
}
