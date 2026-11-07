'use client';

import { isApiError } from '@crm/api-client';
import { Button, Card, Skeleton } from '@crm/ui';
import { Check, Copy, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { PERMISSIONS } from '@/config/permissions';
import { Can } from '@/shared/components/auth/can';
import { RelativeTime } from '@/shared/components/display/relative-time';
import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import { useChannelsQuery, useDeleteChannel, useRotateToken } from '../hooks/use-channels';
import type { Channel } from '../types';
import { ChannelFormDialog } from './channel-form-dialog';

type FormTarget = { channel: Channel | null } | null;
type ConfirmTarget = { channel: Channel; kind: 'delete' | 'rotate' } | null;

function CopyUrl({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-muted flex items-center gap-2 rounded-md px-3 py-2">
      <code dir="ltr" className="text-caption min-w-0 flex-1 truncate">
        {url}
      </code>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        onClick={() => {
          void navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
    </div>
  );
}

export function ChannelsPage() {
  const t = useTranslations('channels');
  const tNav = useTranslations('nav');
  const canManage = useCan(PERMISSIONS.channelConnectionsManage);
  const query = useChannelsQuery();
  const remove = useDeleteChannel();
  const rotate = useRotateToken();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);

  const activeMutation = confirmTarget?.kind === 'rotate' ? rotate : remove;
  const refusal =
    isApiError(activeMutation.error) && activeMutation.error.status === 422
      ? (Object.values(activeMutation.error.fieldErrors)[0]?.[0] ?? activeMutation.error.message)
      : null;
  const channels = query.data ?? [];

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.admin') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Can permission={PERMISSIONS.channelConnectionsManage}>
            <Button onClick={() => setFormTarget({ channel: null })}>
              <Plus aria-hidden />
              {t('actions.create')}
            </Button>
          </Can>
        </PageHeader.Actions>
      </PageHeader>

      {query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : channels.length === 0 ? (
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {channels.map((channel) => (
            <Card key={channel.id} className="gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{channel.name}</h2>
                  <p className="text-small text-muted-foreground">
                    {t(`types.${channel.type}`)}
                    {channel.can_send ? ` · ${t('canSend')}` : ''}
                  </p>
                </div>
                <span
                  className={
                    channel.is_active
                      ? 'bg-success-soft text-success text-caption rounded-full px-2.5 py-0.5'
                      : 'bg-muted text-muted-foreground text-caption rounded-full border px-2.5 py-0.5'
                  }
                >
                  {channel.is_active ? t('active') : t('inactive')}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">{t('webhookUrl')}</p>
                <CopyUrl url={channel.webhook_url} label={t('copy')} />
              </div>

              <p className="text-caption text-muted-foreground">
                {channel.last_received_at ? (
                  <>
                    {t('lastReceived')} <RelativeTime value={channel.last_received_at} />
                  </>
                ) : (
                  t('neverReceived')
                )}
              </p>

              {canManage && (
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => setFormTarget({ channel })}>
                    <Pencil aria-hidden />
                    {t('actions.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmTarget({ channel, kind: 'rotate' })}
                  >
                    <RefreshCw aria-hidden />
                    {t('actions.rotate')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmTarget({ channel, kind: 'delete' })}
                  >
                    <Trash2 aria-hidden />
                    {t('actions.delete')}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {formTarget && (
        <ChannelFormDialog
          key={formTarget.channel?.id ?? 'new'}
          channel={formTarget.channel}
          onClose={() => setFormTarget(null)}
        />
      )}
      {confirmTarget && (
        <ConfirmDialog
          open
          onOpenChange={(isOpen) => !isOpen && !activeMutation.isPending && setConfirmTarget(null)}
          tone="destructive"
          title={t(`${confirmTarget.kind}.title`, { name: confirmTarget.channel.name })}
          description={t(`${confirmTarget.kind}.description`)}
          confirmLabel={t(`${confirmTarget.kind}.confirm`)}
          isPending={activeMutation.isPending}
          errorMessage={refusal}
          onConfirm={() =>
            activeMutation.mutate(confirmTarget.channel.id, {
              onSuccess: () => {
                setConfirmTarget(null);
                if (confirmTarget.kind === 'rotate') toast.info(t('rotate.copyNew'));
              },
            })
          }
        />
      )}
    </>
  );
}
