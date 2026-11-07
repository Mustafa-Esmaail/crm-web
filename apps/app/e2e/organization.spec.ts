import { expect, test } from '@playwright/test';

import { uniqueSuffix } from './helpers';

// One story, in order: each step relies on the one before it, so it is a single test.
test('owner creates a branch and an employee, suspends them, and finds it in the audit log', async ({
  page,
}) => {
  const suffix = uniqueSuffix();
  const branchName = `E2E Branch ${suffix}`;
  const employeeName = `E2E Employee ${suffix}`;

  // 1. Create a branch.
  await page.goto('/en/organization/branches');
  await page.getByRole('button', { name: 'New branch' }).click();
  await page.getByLabel('Name (Arabic)').fill(`فرع ${suffix}`);
  await page.getByLabel('Name (English)').fill(branchName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Branch created')).toBeVisible();
  await page.getByPlaceholder('Search branches…').fill(branchName);
  await expect(page.getByRole('row', { name: new RegExp(branchName) })).toBeVisible();

  // 2. Create an employee.
  await page.goto('/en/organization/employees');
  await page.getByRole('button', { name: 'Add employee' }).click();
  // Scoped to the dialog: the page behind it also has an "email" search box.
  const form = page.getByRole('dialog');
  await form.getByLabel('Full name').fill(employeeName);
  await form.getByLabel('Email').fill(`e2e-${suffix}@demo.test`);
  await form.getByLabel(/^Password/).fill(`Pw-${suffix}-1234`);
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Employee added')).toBeVisible();
  await expect(form).toBeHidden();
  await page.getByPlaceholder(/Search by name/).fill(employeeName);
  const employeeRow = page.getByRole('row', { name: new RegExp(employeeName) });
  await expect(employeeRow).toBeVisible();

  // 3. Suspend them.
  await employeeRow.getByRole('button', { name: /Actions/ }).click();
  await page.getByRole('menuitem', { name: 'Suspend' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Suspend' }).click();
  await expect(employeeRow).toContainText('Suspended');

  // 4. The audit log shows the suspension, newest first.
  await page.goto('/en/settings/audit-log');
  const newest = page.getByRole('row').nth(1);
  await expect(newest).toContainText('Suspended');
  await expect(newest).toContainText('Demo Owner');

  // 5. Clean up the branch; employees cannot be deleted, so the suspended one stays (see README).
  await page.goto('/en/organization/branches');
  await page.getByPlaceholder('Search branches…').fill(branchName);
  await page.getByRole('button', { name: `Delete: ${branchName}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete branch' }).click();
  await expect(page.getByText('Branch deleted')).toBeVisible();
});
