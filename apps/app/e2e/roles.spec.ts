import { expect, test } from '@playwright/test';

import { uniqueSuffix } from './helpers';

test('owner creates a role, grants it permissions, data scope and field access, then deletes it', async ({
  page,
}) => {
  const suffix = uniqueSuffix();
  const roleName = `E2E Role ${suffix}`;

  // 1. Create the role; a bad key is refused before anything is sent.
  await page.goto('/en/access/roles');
  await page.getByRole('button', { name: 'New role' }).click();
  const form = page.getByRole('dialog');
  await form.getByLabel('Name (Arabic)').fill(`دور ${suffix}`);
  await form.getByLabel('Name (English)').fill(roleName);
  await form.getByLabel('Key').first().fill('Not Valid');
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(form.getByText('Start with a letter')).toBeVisible();
  await form.getByLabel('Key').first().fill(`e2e_${suffix}`);
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Role created')).toBeVisible();

  // 2. Permissions: tick a whole module, see the unsaved bar, save.
  await page.getByRole('link', { name: roleName }).first().click();
  await page.getByLabel('Leads', { exact: true }).first().check();
  await expect(page.getByText('You have unsaved changes')).toBeVisible();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Permissions saved')).toBeVisible();
  await expect(page.getByText('All changes saved')).toBeVisible();

  // 3. Data access and field access.
  await page.getByRole('tab', { name: 'Data access' }).click();
  await page.getByRole('combobox', { name: 'Leads' }).click();
  await page.getByRole('option', { name: 'Their team' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Data access saved')).toBeVisible();

  await page.getByRole('tab', { name: 'Field access' }).click();
  await page.getByRole('combobox', { name: 'Employees: Phone' }).click();
  await page.getByRole('option', { name: 'Hidden' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Field access saved')).toBeVisible();

  // 4. Clean up. Built-in roles cannot be deleted, custom ones can.
  await page.goto('/en/access/roles');
  await expect(page.getByRole('button', { name: /^Delete: Owner/ })).toHaveCount(0);
  await page.getByRole('button', { name: `Delete: ${roleName}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete role' }).click();
  await expect(page.getByText('Role deleted')).toBeVisible();
});
