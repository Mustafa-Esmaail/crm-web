'use client';

import { cn } from '@crm/ui';
import { ChevronDown, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/lib/i18n/navigation';
import { UserAvatar } from '@/shared/components/display/user-avatar';

import type { ChartNode } from '../types/chart';
import { NODE_HEIGHT, NODE_WIDTH } from '../utils/layout';

interface ChartNodeCardProps {
  node: ChartNode;
  x: number;
  y: number;
  selected: boolean;
  matched: boolean;
  collapsed: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export function ChartNodeCard({
  node,
  x,
  y,
  selected,
  matched,
  collapsed,
  onSelect,
  onToggle,
}: ChartNodeCardProps) {
  const t = useTranslations('orgChart');
  const hasChildren = node.children.length > 0;
  const title = node.href ? (
    <Link href={node.href} className="hover:text-primary truncate">
      {node.title}
    </Link>
  ) : (
    <span className="truncate">{node.title}</span>
  );

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width: NODE_WIDTH, height: NODE_HEIGHT }}
      data-node-id={node.id}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={() => onSelect(node.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(node.id);
          }
        }}
        className={cn(
          'bg-card shadow-card flex h-full cursor-pointer flex-col justify-between rounded-lg border p-3 transition-colors',
          selected && 'border-primary ring-primary/30 ring-2',
          matched && !selected && 'border-primary',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar id={node.avatarId} name={node.title} size="sm" />
          <div className="min-w-0">
            <p className="text-small text-foreground flex min-w-0 font-semibold">{title}</p>
            {node.subtitle && (
              <p className="text-caption text-muted-foreground truncate">{node.subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-caption text-muted-foreground flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          <span className="num">{t('count', { count: node.count })}</span>
        </div>
      </div>
      {hasChildren && (
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('expand') : t('collapse')}
          className="bg-card text-muted-foreground hover:text-foreground absolute start-1/2 -bottom-2.5 z-10 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border rtl:translate-x-1/2"
        >
          <ChevronDown
            className={cn('size-3 transition-transform', collapsed && 'rotate-180')}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}
