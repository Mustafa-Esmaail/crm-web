'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@crm/ui';
import { ChevronDown, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCurrentUser } from '@/shared/hooks/use-current-user';
import { useLogout } from '@/shared/hooks/use-logout';

import { UserAvatar } from '../display/user-avatar';

export function UserMenu() {
  const t = useTranslations('shell');
  const { user } = useCurrentUser();
  const logout = useLogout();

  if (!user) return null;

  const roleName = user.access?.roles[0]?.name ?? user.job_title;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('userMenu')}
        className="hover:bg-muted flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1"
      >
        <UserAvatar id={user.id} name={user.name} size="sm" />
        <span className="hidden text-start sm:block">
          <span className="text-small block leading-tight font-semibold whitespace-nowrap">
            {user.name}
          </span>
          {roleName && (
            <span className="text-caption text-muted-foreground block leading-tight whitespace-nowrap">
              {roleName}
            </span>
          )}
        </span>
        <ChevronDown className="text-muted-foreground size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <span className="text-small block font-semibold">{user.name}</span>
          <span className="text-caption text-muted-foreground block font-normal" dir="ltr">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onSelect={() => logout.mutate()}
        >
          <LogOut aria-hidden />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
