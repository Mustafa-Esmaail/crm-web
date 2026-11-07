import type { CurrentUser } from '@crm/api-client';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { useCan } from './use-can';
import { AuthContext } from './use-current-user';

const baseUser: CurrentUser = {
  id: 1,
  name: 'Test User',
  email: 'test@demo.test',
  phone: null,
  job_title: null,
  status: 'active',
  is_owner: false,
  locale: 'en',
  last_login_at: null,
  access: { roles: [], permissions: ['employees.view'], scopes: {}, fields: {} },
};

function withUser(user: CurrentUser | undefined) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={{ user, isLoading: false }}>{children}</AuthContext.Provider>
    );
  };
}

describe('useCan', () => {
  it('allows a permission the user was granted', () => {
    const { result } = renderHook(() => useCan('employees.view'), { wrapper: withUser(baseUser) });
    expect(result.current).toBe(true);
  });

  it('denies a permission the user was not granted', () => {
    const { result } = renderHook(() => useCan('employees.offboard'), {
      wrapper: withUser(baseUser),
    });
    expect(result.current).toBe(false);
  });

  it('lets an owner do everything, even with an empty permission list', () => {
    const owner = { ...baseUser, is_owner: true, access: undefined };
    const { result } = renderHook(() => useCan('roles.manage'), { wrapper: withUser(owner) });
    expect(result.current).toBe(true);
  });

  it('denies everything until the user has loaded', () => {
    const { result } = renderHook(() => useCan('employees.view'), { wrapper: withUser(undefined) });
    expect(result.current).toBe(false);
  });

  it('throws a clear error when used outside the provider', () => {
    expect(() => renderHook(() => useCan('employees.view'))).toThrow(/AuthProvider/);
  });
});
