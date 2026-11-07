import { expect, test } from '@playwright/test';

import { signInAsOwner } from './helpers';

test('an anonymous visitor is sent to the login page', async ({ page }) => {
  await page.goto('/en/organization/branches');

  await expect(page).toHaveURL(/\/en\/login/);
});

test('wrong credentials show an error and keep the user on the form', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByLabel(/Email/).fill('owner@demo.test');
  await page.getByLabel(/Password/).fill('definitely-wrong');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/en\/login/);
});

test('signing out ends the session', async ({ page }) => {
  await signInAsOwner(page);

  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/en\/login/);

  await page.goto('/en/organization/branches');
  await expect(page).toHaveURL(/\/en\/login/);
});
