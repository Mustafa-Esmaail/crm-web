'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@crm/ui';
import { ArrowRightLeft, MoreHorizontal, Pencil, Trash2, UserRoundCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PERMISSIONS } from '@/config/permissions';
import { useCan } from '@/shared/hooks/use-can';

import type { Deal } from '../types';

export interface DealActions {
  onEdit: (deal: Deal) => void;
  onChangeStage: (deal: Deal) => void;
  onAssign: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}

interface DealActionsMenuProps {
  deal: Deal;
  actions: DealActions;
}

/** Every item is gated by its own permission; with none of them there is no menu at all. */
export function DealActionsMenu({ deal, actions }: DealActionsMenuProps) {
  const t = useTranslations('deals.actions');
  const canUpdate = useCan(PERMISSIONS.dealsUpdate);
  const canAssign = useCan(PERMISSIONS.dealsAssign);
  const canDelete = useCan(PERMISSIONS.dealsDelete);

  if (!canUpdate && !canAssign && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`${t('menu')}: ${deal.title}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {canUpdate && (
          <>
            <DropdownMenuItem onSelect={() => actions.onEdit(deal)}>
              <Pencil aria-hidden />
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => actions.onChangeStage(deal)}>
              <ArrowRightLeft aria-hidden />
              {t('changeStage')}
            </DropdownMenuItem>
          </>
        )}
        {canAssign && (
          <DropdownMenuItem onSelect={() => actions.onAssign(deal)}>
            <UserRoundCheck aria-hidden />
            {t('assign')}
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => actions.onDelete(deal)}>
              <Trash2 aria-hidden />
              {t('delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
