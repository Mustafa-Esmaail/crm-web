import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import messages from '@/messages/en.json';

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/** Renders with the real English bundle, so tests also catch a missing message key. */
export function renderWithIntl(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: IntlWrapper, ...options });
}
