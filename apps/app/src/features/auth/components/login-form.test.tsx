import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { createFetchHttpClient } from '@/lib/api/http-client';
import { HttpClientContext } from '@/shared/hooks/use-http-client';

import { renderWithIntl } from '../../../../tests/render';
import { API_ORIGIN, server } from '../../../../tests/server';
import { LoginForm } from './login-form';

vi.setConfig({ testTimeout: 30_000 });
const SLOW = { timeout: 15_000 };
const replace = vi.fn();
vi.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const user = {
  id: 1,
  name: 'Demo Owner',
  email: 'owner@demo.test',
  phone: null,
  job_title: null,
  status: 'active',
  is_owner: true,
  locale: 'en',
  last_login_at: null,
};

const DEMO_ON = {
  enabled: true,
  password: 'password',
  accounts: [
    { role: 'owner', email: 'owner@demo.test' },
    { role: 'sales_manager', email: 'sales.director@demo.test' },
  ],
};
const DEMO_OFF = { enabled: false, accounts: [] };

const httpClient = createFetchHttpClient({
  baseUrl: `${API_ORIGIN}/api/proxy`,
  getLocale: () => 'en',
  getFallbackMessage: () => 'fallback',
  onUnauthorized: () => undefined,
});

/** The API's DEMO flag decides whether the demo panel shows; it is off unless a test turns it on. */
function renderForm({ demo = DEMO_OFF }: { demo?: typeof DEMO_ON | typeof DEMO_OFF } = {}) {
  server.use(
    http.get(`${API_ORIGIN}/api/proxy/auth/demo`, () => HttpResponse.json({ data: demo })),
  );
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderWithIntl(
    <QueryClientProvider client={client}>
      <HttpClientContext.Provider value={httpClient}>
        <LoginForm />
      </HttpClientContext.Provider>
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  it('asks for both fields before calling the server', async () => {
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findAllByText('This field is required.')).toHaveLength(2);
  });

  it('shows the API message when the credentials are wrong', async () => {
    server.use(
      http.post(`${API_ORIGIN}/api/auth/login`, () =>
        HttpResponse.json({ message: 'These credentials do not match.' }, { status: 401 }),
      ),
    );
    renderForm();

    await userEvent.type(screen.getByLabelText(/Email/), 'owner@demo.test');
    await userEvent.type(screen.getByLabelText(/Password/), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('These credentials do not match.', {}, SLOW),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('puts a field-level 422 under the field and signs in on success', async () => {
    server.use(
      http.post(`${API_ORIGIN}/api/auth/login`, async ({ request }) => {
        const body = (await request.json()) as { email: string };
        if (body.email === 'bad@demo.test') {
          return HttpResponse.json(
            { message: 'Invalid', errors: { email: ['No account uses this email.'] } },
            { status: 422 },
          );
        }
        return HttpResponse.json({ user });
      }),
    );
    renderForm();

    await userEvent.type(screen.getByLabelText(/Email/), 'bad@demo.test');
    await userEvent.type(screen.getByLabelText(/Password/), 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('No account uses this email.', {}, SLOW)).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/Email/));
    await userEvent.type(screen.getByLabelText(/Email/), 'owner@demo.test');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'), SLOW);
  });

  it('signs in with one click as a demo role and offers a real account', async () => {
    let sent: { email: string; password: string } | undefined;
    server.use(
      http.post(`${API_ORIGIN}/api/auth/login`, async ({ request }) => {
        sent = (await request.json()) as { email: string; password: string };
        return HttpResponse.json({ user });
      }),
    );
    replace.mockClear();
    renderForm({ demo: DEMO_ON });

    const signInAsManager = await screen.findByRole(
      'button',
      { name: 'Sign in as Sales manager' },
      SLOW,
    );
    expect(screen.getByRole('link', { name: /Create my own account/ })).toHaveAttribute(
      'href',
      '/register',
    );

    await userEvent.click(signInAsManager);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'), SLOW);
    expect(sent).toMatchObject({ email: 'sales.director@demo.test', password: 'password' });
  });

  it('hides the demo when the API has it switched off', async () => {
    renderForm({ demo: DEMO_OFF });

    expect(await screen.findByRole('link', { name: 'Register your company' }, SLOW)).toBeVisible();
    expect(screen.queryByRole('button', { name: /Sign in as/ })).not.toBeInTheDocument();
  });
});
