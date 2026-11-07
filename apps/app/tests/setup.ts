import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { API_ORIGIN, server } from './server';

// Unhandled requests fail the test: a forgotten handler must never silently hit a real network.
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });

  // Node's fetch needs absolute URLs, while the app calls relative ones (`/api/...`) in the browser.
  // Installed after `listen` so it is the outermost layer: MSW builds a Request first and would
  // reject a relative URL before this wrapper ran.
  const interceptedFetch = globalThis.fetch;
  globalThis.fetch = (input, init) =>
    interceptedFetch(
      typeof input === 'string' && input.startsWith('/') ? `${API_ORIGIN}${input}` : input,
      init,
    );
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// jsdom has no layout engine; Radix and cmdk expect these browser APIs to exist.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
Element.prototype.scrollIntoView ??= () => {};
Element.prototype.hasPointerCapture ??= () => false;
