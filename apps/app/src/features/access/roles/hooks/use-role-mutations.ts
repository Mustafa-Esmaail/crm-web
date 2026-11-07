'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useHttpClient } from '@/shared/hooks/use-http-client';
import { useToastUnexpectedError } from '@/shared/hooks/use-toast-unexpected-error';
import { CURRENT_USER_QUERY_KEY } from '@/shared/providers/auth-provider';

import {
  createRole,
  deleteRole,
  saveRoleFields,
  saveRolePermissions,
  saveRoleScopes,
  syncEmployeeRoles,
  updateRole,
} from '../api/role-requests';
import { roleKeys } from '../constants';
import type { RoleFormValues } from '../schemas';
import { toRolePayload } from '../utils/mappers';

interface SaveRoleInput {
  /** Present when editing; absent when creating. */
  id?: number;
  values: RoleFormValues;
}

export function useSaveRole() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('roles');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: ({ id, values }: SaveRoleInput) => {
      const body = toRolePayload(values);
      return id === undefined ? createRole(http, body) : updateRole(http, id, body);
    },
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(id === undefined ? t('toast.created') : t('toast.updated'));
    },
    onError: toastUnexpected,
  });
}

export function useDeleteRole() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('roles');
  const toastUnexpected = useToastUnexpectedError();

  return useMutation({
    mutationFn: (id: number) => deleteRole(http, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(t('toast.deleted'));
    },
    onError: toastUnexpected,
  });
}

/** Saving permissions can change what the signed-in user may do, so the session is refreshed too. */
function useAfterAccessChange() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
}

export function useSavePermissions(roleId: number) {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = useTranslations('roles');
  const refreshSession = useAfterAccessChange();

  return useMutation({
    mutationFn: (permissions: string[]) => saveRolePermissions(http, roleId, permissions),
    onSuccess: (response) => {
      queryClient.setQueryData(roleKeys.matrix(roleId, locale), response);
      void refreshSession();
      toast.success(t('toast.permissionsSaved'));
    },
  });
}

export function useSyncEmployeeRoles(employeeId: number) {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const t = useTranslations('roles');
  const refreshSession = useAfterAccessChange();

  return useMutation({
    mutationFn: (roleIds: number[]) => syncEmployeeRoles(http, employeeId, roleIds),
    onSuccess: () => {
      // The roles list carries head-counts, and the person may be the one signed in.
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
      void refreshSession();
      toast.success(t('toast.assigned'));
    },
  });
}

export function useSaveScopes(roleId: number) {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = useTranslations('roles');
  const refreshSession = useAfterAccessChange();

  return useMutation({
    mutationFn: (scopes: Record<string, string>) => saveRoleScopes(http, roleId, scopes),
    onSuccess: (response) => {
      queryClient.setQueryData(roleKeys.scopes(roleId, locale), response);
      void refreshSession();
      toast.success(t('toast.scopesSaved'));
    },
  });
}

export function useSaveFields(roleId: number) {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = useTranslations('roles');
  const refreshSession = useAfterAccessChange();

  return useMutation({
    mutationFn: (fields: Record<string, Record<string, string>>) =>
      saveRoleFields(http, roleId, fields),
    onSuccess: (response) => {
      queryClient.setQueryData(roleKeys.fields(roleId, locale), response);
      void refreshSession();
      toast.success(t('toast.fieldsSaved'));
    },
  });
}
