'use client';

import { isApiError } from '@crm/api-client';
import { Button, Card, cn, Skeleton, Textarea } from '@crm/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { z } from 'zod';

import { PERMISSIONS } from '@/config/permissions';
import { RelativeTime } from '@/shared/components/display/relative-time';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { FormAlert } from '@/shared/components/form/form-alert';
import { useCan } from '@/shared/hooks/use-can';
import { useHttpClient } from '@/shared/hooks/use-http-client';

const messageSchema = z.object({
  id: z.number(),
  direction: z.enum(['inbound', 'outbound']),
  status: z.enum(['received', 'sent', 'failed']),
  channel: z.object({ id: z.number(), type: z.string(), name: z.string() }),
  counterpart: z.string(),
  body: z.string(),
  error: z.string().nullable(),
  created_at: z.string().nullable(),
});
const messageListSchema = z.object({ data: z.array(messageSchema) });
const connectionListSchema = z.object({
  data: z.array(
    z.object({ id: z.number(), name: z.string(), type: z.string(), can_send: z.boolean() }),
  ),
});
const sentSchema = z.object({ data: messageSchema });

const MAX_LENGTH = 1000;

/** The WhatsApp / SMS conversation with one lead, newest at the bottom, plus a box to reply. */
export function LeadMessages({ leadId }: { leadId: number }) {
  const t = useTranslations('leads.messages');
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const canView = useCan(PERMISSIONS.channelMessagesView);
  const canSend = useCan(PERMISSIONS.channelMessagesSend);
  const [body, setBody] = useState('');
  const [connectionId, setConnectionId] = useState('');
  const [alert, setAlert] = useState<string[]>([]);
  const listKey = ['leads', 'messages', leadId] as const;

  const messages = useQuery({
    queryKey: listKey,
    queryFn: ({ signal }) =>
      http.request(`/leads/${leadId}/messages`, messageListSchema, {
        params: { per_page: 100 },
        signal,
      }),
    select: (response) => [...response.data].reverse(),
    enabled: canView,
    // New inbound messages arrive by webhook, so look again now and then.
    refetchInterval: 30_000,
  });

  // Only connections that can send are offered; viewers without that permission just read.
  const connections = useQuery({
    queryKey: ['channel-connections', 'senders'],
    queryFn: ({ signal }) =>
      http.request('/channel-connections', connectionListSchema, {
        params: { is_active: '1', per_page: 100 },
        signal,
      }),
    select: (response) => response.data.filter((connection) => connection.can_send),
    enabled: canSend,
  });
  const senders = connections.data ?? [];
  const selected = connectionId || (senders[0] ? String(senders[0].id) : '');

  const send = useMutation({
    mutationFn: () =>
      http.request(`/leads/${leadId}/messages`, sentSchema, {
        method: 'POST',
        body: { connection_id: Number(selected), body: body.trim() },
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: ['leads', 'activities', leadId] });
      // A refused send is stored as "failed" with the reason; keep the text so it can be retried.
      if (result.data.status === 'failed') {
        setAlert([result.data.error ?? t('failed')]);
        return;
      }
      setAlert([]);
      setBody('');
    },
    onError: (error) => setAlert([isApiError(error) ? error.message : t('failed')]),
  });

  if (!canView) return null;
  const list = messages.data ?? [];

  return (
    <Card className="gap-0 py-4">
      <h2 className="text-card-title px-5 pb-3 font-semibold">{t('title')}</h2>

      {messages.error ? (
        <ErrorState error={messages.error} onRetry={() => void messages.refetch()} />
      ) : messages.isLoading ? (
        <div className="px-5">
          <Skeleton className="h-16 w-full" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-small text-muted-foreground px-5 pb-2">{t('empty')}</p>
      ) : (
        <ul className="max-h-96 space-y-3 overflow-y-auto border-t px-5 py-4">
          {list.map((message) => (
            <li
              key={message.id}
              className={cn('flex flex-col gap-1', message.direction === 'outbound' && 'items-end')}
            >
              <div
                className={cn(
                  'text-small max-w-[85%] rounded-lg px-3 py-2 whitespace-pre-wrap',
                  message.direction === 'outbound'
                    ? 'bg-primary-soft text-foreground'
                    : 'bg-muted text-foreground',
                  message.status === 'failed' && 'border-destructive border',
                )}
              >
                {message.body}
              </div>
              <p className="text-caption text-text-faint">
                {message.channel.name} · <RelativeTime value={message.created_at} />
                {message.status === 'failed' && (
                  <span className="text-destructive"> · {message.error ?? t('failed')}</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      {canSend && (
        <form
          className="space-y-3 border-t px-5 pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (body.trim() && selected) send.mutate();
          }}
        >
          <FormAlert messages={alert} />
          {senders.length === 0 ? (
            <p className="text-small text-muted-foreground">
              {connections.isLoading ? t('loadingChannels') : t('noChannel')}
            </p>
          ) : (
            <>
              {senders.length > 1 && (
                <select
                  aria-label={t('channel')}
                  className="h-field bg-background w-full rounded-md border px-3 text-sm"
                  value={selected}
                  onChange={(event) => setConnectionId(event.target.value)}
                >
                  {senders.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name}
                    </option>
                  ))}
                </select>
              )}
              <Textarea
                aria-label={t('placeholder')}
                placeholder={t('placeholder')}
                value={body}
                maxLength={MAX_LENGTH}
                onChange={(event) => setBody(event.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={send.isPending || !body.trim()}>
                  {send.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <Send className="rtl:-scale-x-100" aria-hidden />
                  )}
                  {t('send')}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </Card>
  );
}
