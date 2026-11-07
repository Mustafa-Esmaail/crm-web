'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { buildListParams } from '@/lib/api/list-params';
import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';

import type { ChannelFormValues } from '../schemas';
import { channelListSchema } from '../types';
import { toChannelPayload } from '../utils/mappers';

const channelKeys = { all: ['channel-connections'] as const };
const savedSchema = z.object({ data: z.object({ id: z.number() }) });

export function useChannelsQuery() {
  const http = useHttpClient();
  const params = buildListParams({ perPage: 100 });

  return useQuery({
    queryKey: [...channelKeys.all, params],
    queryFn: ({ signal }) =>
      http.request('/channel-connections', channelListSchema, { params, signal }),
    select: (response) => response.data,
  });
}

export function useSaveChannel() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('channels');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: ChannelFormValues }) => {
      const body = toChannelPayload(values, id === undefined);
      return id === undefined
        ? http.request('/channel-connections', savedSchema, { method: 'POST', body })
        : http.request(`/channel-connections/${id}`, savedSchema, { method: 'PUT', body });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: channelKeys.all });
      toast.success(t('toast.saved'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteChannel() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('channels');

  return useMutation({
    mutationFn: (id: number) =>
      http.request(`/channel-connections/${id}`, z.undefined(), { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: channelKeys.all });
      toast.success(t('toast.deleted'));
    },
  });
}

export function useRotateToken() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('channels');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) =>
      http.request(`/channel-connections/${id}/rotate-token`, savedSchema, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: channelKeys.all });
      toast.success(t('toast.rotated'));
    },
    onError: toastUnexpected,
  });
}
