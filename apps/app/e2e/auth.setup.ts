import { test as setup } from '@playwright/test';

import { AUTH_FILE, signInAsOwner } from './helpers';

// The API rate-limits logins, so the suite signs in once here and every other test reuses the
// saved session instead of going through the form again.
setup('sign in as the demo owner', async ({ page }) => {
  await signInAsOwner(page);
  await page.context().storageState({ path: AUTH_FILE });
});
