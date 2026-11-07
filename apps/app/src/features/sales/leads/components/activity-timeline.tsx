'use client';

import { isApiError } from '@crm/api-client';
import { Button, Card, cn, Skeleton, Textarea } from '@crm/ui';
import {
  ArrowRightLeft,
  CalendarClock,
  FileText,
  Loader2,
  type LucideIcon,
  Mail,
  MessageCircle,
  Phone,
  UserRoundCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { RelativeTime } from '@/shared/components/display/relative-time';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { FormAlert } from '@/shared/components/form/form-alert';
import { useCan } from '@/shared/hooks/use-can';

import { ACTIVITY_TYPES, type ActivityType } from '../constants';
import { useLogLeadActivity } from '../hooks/use-lead-mutations';
import { useLeadActivitiesQuery } from '../hooks/use-lead-queries';

// Registry: a new activity type is one entry here plus its label in the messages. The first five
// are what people log by hand; the last two are written by the system when a lead changes.
const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  note: FileText,
  call: Phone,
  meeting: CalendarClock,
  whatsapp: MessageCircle,
  email: Mail,
  assigned: UserRoundCheck,
  stage_changed: ArrowRightLeft,
};

/** A type the app has no label for yet still reads as words ("stage_changed" -> "stage changed"). */
function humanize(type: string): string {
  return type.replaceAll('_', ' ');
}

export function ActivityTimeline({ leadId }: { leadId: number }) {
  const t = useTranslations('leads.activity');
  const canLog = useCan(PERMISSIONS.leadsUpdate);
  const query = useLeadActivitiesQuery(leadId);

  return (
    <Card className="gap-4 py-5">
      <h2 className="text-card-title text-foreground px-5 font-semibold">{t('title')}</h2>
      {canLog && <LogActivityForm leadId={leadId} />}

      <div className="border-t px-5 pt-4">
        {query.isPending && <Skeleton className="h-24 w-full" />}
        {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}
        {query.data?.length === 0 && <EmptyState title={t('empty')} className="py-8" />}
        <ul className="space-y-4">
          {query.data?.map((entry) => {
            const Icon = ACTIVITY_ICONS[entry.type] ?? FileText;
            return (
              <li key={entry.id} className="flex items-start gap-3">
                <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-small text-foreground">
                    <span className="font-semibold">
                      {t.has(`types.${entry.type}`)
                        ? t(`types.${entry.type}`)
                        : humanize(entry.type)}
                    </span>
                    {entry.user && (
                      <span className="text-muted-foreground"> · {entry.user.name}</span>
                    )}
                  </p>
                  {entry.body && (
                    <p className="text-small text-secondary-foreground whitespace-pre-wrap">
                      {entry.body}
                    </p>
                  )}
                  <p className="text-caption text-text-faint">
                    <RelativeTime value={entry.occurred_at} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

function LogActivityForm({ leadId }: { leadId: number }) {
  const t = useTranslations('leads.activity');
  const [type, setType] = useState<ActivityType>('note');
  const [body, setBody] = useState('');
  const log = useLogLeadActivity(leadId);
  const errors = isApiError(log.error) ? [log.error.message] : [];

  return (
    <form
      className="space-y-3 px-5"
      onSubmit={(event) => {
        event.preventDefault();
        log.mutate({ type, body }, { onSuccess: () => setBody('') });
      }}
    >
      <FormAlert messages={errors} />
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('typeLabel')}>
        {ACTIVITY_TYPES.map((value) => {
          const Icon = ACTIVITY_ICONS[value] ?? FileText;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={cn(
                'text-small h-chip flex items-center gap-1.5 rounded-full border px-3 transition-colors',
                type === value
                  ? 'border-primary bg-primary-soft text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {t(`types.${value}`)}
            </button>
          );
        })}
      </div>
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('placeholder')}
        rows={3}
        maxLength={5000}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={log.isPending}>
          {log.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t('log')}
        </Button>
      </div>
    </form>
  );
}
