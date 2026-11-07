'use client';

import { Skeleton } from '@crm/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Link } from '@/lib/i18n/navigation';
import { Amount } from '@/shared/components/display/amount';
import { FormattedDate } from '@/shared/components/display/formatted-date';
import { StageBadge } from '@/shared/components/display/stage-badge';
import { UserAvatar } from '@/shared/components/display/user-avatar';
import { ErrorState } from '@/shared/components/feedback/error-state';

import type { Deal, DealStage } from '../types';
import { groupByStage } from '../utils/mappers';
import { type DealActions, DealActionsMenu } from './deal-actions-menu';

interface DealBoardProps {
  stages: DealStage[] | undefined;
  deals: Deal[];
  isLoading: boolean;
  error?: unknown;
  onRetry: () => void;
  actions: DealActions;
}

/**
 * One column per pipeline stage. Deals move with the card menu rather than by dragging, which
 * keeps the board usable by keyboard and screen reader; a drag layer can be added on top later.
 */
export function DealBoard({ stages, deals, isLoading, error, onRetry, actions }: DealBoardProps) {
  const t = useTranslations('deals');
  const columns = useMemo(() => groupByStage(deals, stages ?? []), [deals, stages]);

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
            className="bg-muted/60 w-72 shrink-0 space-y-3 rounded-lg border p-3"
          >
            <header className="flex items-center justify-between gap-2">
              <StageBadge name={stage.name} color={stage.color} />
              <span className="text-caption text-muted-foreground num">
                {t('board.count', { count: stage.deals_count ?? cards.length })}
              </span>
            </header>
            <p className="text-small text-foreground px-1 font-semibold">
              <Amount value={stage.deals_value} fallback="0" />
            </p>

            <ul className="space-y-2">
              {cards.map((deal) => (
                <li key={deal.id} className="bg-card shadow-card space-y-2 rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-small text-foreground font-semibold hover:underline"
                    >
                      {deal.title}
                    </Link>
                    <DealActionsMenu deal={deal} actions={actions} />
                  </div>
                  <p className="text-small text-foreground">
                    <Amount value={deal.value} />
                  </p>
                  <div className="text-caption text-muted-foreground flex items-center justify-between gap-2">
                    {deal.owner ? (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <UserAvatar
                          id={deal.owner.id}
                          name={deal.owner.name}
                          size="sm"
                          className="size-6"
                        />
                        <span className="truncate">{deal.owner.name}</span>
                      </span>
                    ) : (
                      <span className="text-text-faint">{t('unassigned')}</span>
                    )}
                    {deal.expected_close_date && (
                      <FormattedDate value={deal.expected_close_date} pattern="d MMM" />
                    )}
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
