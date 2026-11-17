'use client';

import { Skeleton } from '@crm/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Link } from '@/lib/i18n/navigation';
import { Amount } from '@/shared/components/display/amount';
import { RelativeTime } from '@/shared/components/display/relative-time';
import { StageBadge } from '@/shared/components/display/stage-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { useStageDrag } from '@/shared/hooks/use-stage-drag';

import type { Lead, LeadStage } from '../types';
import { groupLeadsByStage } from '../utils/mappers';
import { type LeadActions, LeadActionsMenu } from './lead-actions-menu';

interface LeadBoardProps {
  stages: LeadStage[] | undefined;
  leads: Lead[];
  isLoading: boolean;
  error?: unknown;
  onRetry: () => void;
  actions: LeadActions;
  /** Whether the reader may drag leads between stages. */
  canMove: boolean;
  onMove: (lead: Lead, stage: LeadStage) => void;
}

/**
 * One column per lead stage. Leads can be dragged between columns; the card menu's
 * "Change stage" stays as the keyboard and screen-reader path.
 */
export function LeadBoard({
  stages,
  leads,
  isLoading,
  error,
  onRetry,
  actions,
  canMove,
  onMove,
}: LeadBoardProps) {
  const t = useTranslations('leads');
  const columns = useMemo(() => groupLeadsByStage(leads, stages ?? []), [leads, stages]);
  const drag = useStageDrag<Lead>({
    isEnabled: canMove,
    getId: (lead) => lead.id,
    getStageId: (lead) => lead.stage?.id,
    onMove: (lead, stageId) => {
      const stage = stages?.find((candidate) => candidate.id === stageId);
      if (stage) onMove(lead, stage);
    },
  });

  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isLoading || !stages) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-80 w-72 shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="scrollbar-neutral flex items-start gap-4 overflow-x-auto pb-3">
      {stages.map((stage) => {
        const cards = columns.get(stage.id) ?? [];

        return (
          <section
            key={stage.id}
            aria-label={stage.name}
            className="bg-muted/60 data-[drop-target]:border-primary data-[drop-target]:bg-primary-soft w-72 shrink-0 space-y-3 rounded-lg border p-3 transition-colors"
            {...drag.columnProps(stage.id)}
          >
            <header className="flex items-center justify-between gap-2">
              <StageBadge name={stage.name} color={stage.color} />
              <span className="text-caption text-muted-foreground num">
                {t('board.count', { count: cards.length })}
              </span>
            </header>

            <ul className="min-h-16 space-y-2">
              {cards.map((lead) => (
                <li
                  key={lead.id}
                  className="bg-card shadow-card space-y-2 rounded-md border p-3 data-[dragging]:opacity-50 [&[draggable=true]]:cursor-grab"
                  {...drag.cardProps(lead)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-small text-foreground block truncate font-semibold hover:underline"
                      >
                        {lead.name}
                      </Link>
                      {lead.phone && (
                        <p className="text-caption text-muted-foreground num" dir="ltr">
                          {lead.phone}
                        </p>
                      )}
                    </div>
                    <LeadActionsMenu lead={lead} actions={actions} />
                  </div>
                  {(lead.source || lead.budget) && (
                    <div className="text-caption text-muted-foreground flex items-center justify-between gap-2">
                      <span className="truncate">{lead.source?.name}</span>
                      {lead.budget ? <Amount value={lead.budget} /> : null}
                    </div>
                  )}
                  <div className="text-caption text-muted-foreground flex items-center justify-between gap-2">
                    {lead.owner ? (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <UserAvatar
                          id={lead.owner.id}
                          name={lead.owner.name}
                          size="sm"
                          className="size-6"
                        />
                        <span className="truncate">{lead.owner.name}</span>
                      </span>
                    ) : (
                      <span className="text-text-faint">{t('unassigned')}</span>
                    )}
                    {lead.last_activity_at && <RelativeTime value={lead.last_activity_at} />}
                  </div>
                </li>
              ))}
              {cards.length === 0 && (
                <li className="text-caption text-text-faint px-1 py-4 text-center">
                  {t('board.empty')}
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
