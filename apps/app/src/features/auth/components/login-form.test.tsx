import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

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

function renderForm() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderWithIntl(
    <QueryClientProvider client={client}>
      <LoginForm />
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
});
