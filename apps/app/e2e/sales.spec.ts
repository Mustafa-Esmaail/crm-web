import { expect, test } from '@playwright/test';

import { uniqueSuffix } from './helpers';

test('owner creates a lead, logs a call, loses it with a reason, assigns it, then deletes it', async ({
  page,
}) => {
  const name = `E2E Lead ${uniqueSuffix()}`;

  // 1. Create: the form checks the phone before anything is sent.
  await page.goto('/en/leads');
  await page.getByRole('button', { name: 'New lead' }).click();
  const form = page.getByRole('dialog');
  await form.getByLabel('Phone').fill('12ab');
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(form.getByText('Use digits only')).toBeVisible();
  await form.getByLabel(/^Name/).fill(name);
  await form.getByLabel('Phone').fill('+201000000001');
  await form.getByLabel('Budget').fill('1500000');
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Lead created')).toBeVisible();

  // 2. Open it and log a call.
  await page.getByPlaceholder(/Search by name/).fill(name);
  await page.getByRole('link', { name }).first().click();
  // The first visit to a route compiles it in the dev server, which can take a while.
  await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('1,500,000').first()).toBeVisible();
  await page.getByRole('radio', { name: 'Call' }).click();
  await page.getByPlaceholder(/What happened/).fill('Intro call');
  await page.getByRole('button', { name: 'Log activity' }).click();
  await expect(page.getByText('Intro call')).toBeVisible();

  // 3. Move it to Lost: the reason box appears only for a lost stage.
  await page.getByRole('button', { name: 'Change stage' }).click();
  const stage = page.getByRole('dialog');
  await expect(stage.getByLabel('Why was it lost?')).toBeHidden();
  await stage.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Lost' }).click();
  await stage.getByLabel('Why was it lost?').fill('Budget too low');
  await stage.getByRole('button', { name: 'Move lead' }).click();
  await expect(page.getByText('Lead moved')).toBeVisible();
  await expect(page.getByText('Budget too low').first()).toBeVisible();

  // 4. Assign it to someone.
  await page.getByRole('button', { name: 'Assign' }).click();
  const assign = page.getByRole('dialog');
  await assign.getByText('Select…').click();
  await page.getByRole('option').first().click();
  await assign.getByRole('button', { name: 'Assign' }).click();
  await expect(page.getByText('Lead assigned')).toBeVisible();

  // 5. Delete it; the page leaves without errors.
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete lead' }).click();
  await expect(page).toHaveURL(/\/en\/leads$/);
});

test('owner creates a deal on the pipeline, moves it to another stage, then deletes it', async ({
  page,
}) => {
  const title = `E2E Deal ${uniqueSuffix()}`;

  await page.goto('/en/deals');
  await page.getByRole('button', { name: 'New deal' }).click();
  const form = page.getByRole('dialog');
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(form.getByText('This field is required.').first()).toBeVisible();
  await form.getByLabel(/^Title/).fill(title);
  await form.getByLabel('Value').fill('750000');
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Deal created')).toBeVisible();

  // The new deal lands in the first column, then moves to "Proposal".
  await page.getByPlaceholder('Search deals…').fill(title);
  const card = page.locator('li', { hasText: title });
  await expect(card).toBeVisible();
  await expect(page.getByRole('region', { name: 'Qualification' }).getByText(title)).toBeVisible();

  await card.getByRole('button', { name: /^Actions/ }).click();
  await page.getByRole('menuitem', { name: 'Change stage' }).click();
  const stage = page.getByRole('dialog');
  await stage.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Proposal' }).click();
  await stage.getByRole('button', { name: 'Move deal' }).click();
  await expect(page.getByText('Deal moved')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Proposal' }).getByText(title)).toBeVisible();

  await card.getByRole('button', { name: /^Actions/ }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete deal' }).click();
  await expect(page.getByText('Deal deleted')).toBeVisible();
  await expect(page.locator('li', { hasText: title })).toHaveCount(0);
});
