'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@crm/ui';
import { ArrowRightLeft, Eye, MoreHorizontal, Pencil, Trash2, UserRoundCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PERMISSIONS } from '@/config/permissions';
import { Link } from '@/lib/i18n/navigation';
import { useCan } from '@/shared/hooks/use-can';

import type { Lead } from '../types';

export interface LeadActions {
  onEdit: (lead: Lead) => void;
  onChangeStage: (lead: Lead) => void;
  onAssign: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

interface LeadActionsMenuProps {
  lead: Lead;
  actions: LeadActions;
}

/** Every item is gated by its own permission; a user with none of them still gets "view". */
export function LeadActionsMenu({ lead, actions }: LeadActionsMenuProps) {
  const t = useTranslations('leads.actions');
  const canUpdate = useCan(PERMISSIONS.leadsUpdate);
  const canAssign = useCan(PERMISSIONS.leadsAssign);
  const canDelete = useCan(PERMISSIONS.leadsDelete);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`${t('menu')}: ${lead.name}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <Link href={`/leads/${lead.id}`}>
            <Eye aria-hidden />
            {t('view')}
          </Link>
        </DropdownMenuItem>
        {canUpdate && (
          <>
            <DropdownMenuItem onSelect={() => actions.onEdit(lead)}>
              <Pencil aria-hidden />
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => actions.onChangeStage(lead)}>
              <ArrowRightLeft aria-hidden />
              {t('changeStage')}
            </DropdownMenuItem>
          </>
        )}
        {canAssign && (
          <DropdownMenuItem onSelect={() => actions.onAssign(lead)}>
            <UserRoundCheck aria-hidden />
            {t('assign')}
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => actions.onDelete(lead)}>
              <Trash2 aria-hidden />
              {t('delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
