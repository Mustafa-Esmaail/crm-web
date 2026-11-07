'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { useHttpClient } from '@/shared/hooks/use-http-client';

import {
  getCatalog,
  getEmployeeRoles,
  getRole,
  getRoleFields,
  getRoleMatrix,
  getRoles,
  getRoleScopes,
} from '../api/role-requests';
import { roleKeys } from '../constants';

export function useRolesQuery() {
  const http = useHttpClient();

  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: ({ signal }) => getRoles(http, signal),
    select: (response) => response.data,
  });
}

export function useRoleQuery(id: number) {
  const http = useHttpClient();

  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: ({ signal }) => getRole(http, id, signal),
    select: (response) => response.data,
  });
}

export function useEmployeeRolesQuery(employeeId: number) {
  const http = useHttpClient();

  return useQuery({
    queryKey: roleKeys.employee(employeeId),
    queryFn: ({ signal }) => getEmployeeRoles(http, employeeId, signal),
    select: (response) => response.data,
  });
}

/** The scope and field-access options a role can pick from. */
export function usePermissionCatalog() {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: roleKeys.catalog(locale),
    queryFn: ({ signal }) => getCatalog(http, signal),
    select: (response) => response.data,
    staleTime: Infinity,
  });
}

export function useRoleMatrixQuery(id: number) {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: roleKeys.matrix(id, locale),
    queryFn: ({ signal }) => getRoleMatrix(http, id, signal),
    select: (response) => response.data,
  });
}

export function useRoleScopesQuery(id: number) {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: roleKeys.scopes(id, locale),
    queryFn: ({ signal }) => getRoleScopes(http, id, signal),
    select: (response) => response.data,
  });
}

export function useRoleFieldsQuery(id: number) {
  const http = useHttpClient();
  const locale = useLocale();

  return useQuery({
    queryKey: roleKeys.fields(id, locale),
    queryFn: ({ signal }) => getRoleFields(http, id, signal),
    select: (response) => response.data,
  });
}
