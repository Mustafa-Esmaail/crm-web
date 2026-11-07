import { expect, type Page } from '@playwright/test';

import { DEMO_CREDENTIALS } from '../src/features/auth/constants';

/** Where the setup project saves the signed-in session for the other tests to reuse. */
export const AUTH_FILE = 'e2e/.auth/owner.json';

/** Signs in through the real form, so the BFF cookie is set exactly as it is for a user. */
export async function signInAsOwner(page: Page) {
  await page.goto('/en/login');
  await page.getByLabel(/Email/).fill(DEMO_CREDENTIALS.email);
  await page.getByLabel(/Password/).fill(DEMO_CREDENTIALS.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
}

/** A name no earlier run used, so repeated runs never collide on unique fields. */
export function uniqueSuffix() {
  return Date.now().toString(36);
}
