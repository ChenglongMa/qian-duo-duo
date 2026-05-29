import { expect, test } from '@playwright/test';

const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
const adminPassword = process.env.ADMIN_PASSWORD ?? 'CorrectHorse!2026';

test('login -> create ledger -> create category -> create entry -> edit entry -> soft delete', async ({ page }) => {
  const suffix = Date.now().toString();
  const ledgerName = `E2E Household ${suffix}`;
  const categoryName = `E2E Food ${suffix}`;
  const categoryKey = `e2e_food_${suffix}`;

  await page.goto('/');

  await page.getByLabel('Admin username').fill(adminUsername);
  await page.getByLabel('Password').fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Create ledger' })).toBeVisible();

  await page.getByLabel('Ledger name').fill(ledgerName);
  await page.getByLabel('Base currency').fill('AUD');
  await page.getByLabel('Timezone').fill('Australia/Melbourne');
  await page.getByRole('button', { name: 'Create ledger' }).click();
  await expect(page.getByText('Ledger created.')).toBeVisible();

  await page.getByLabel('Category key').fill(categoryKey);
  await page.getByLabel('Category name').fill(categoryName);
  await page.getByRole('button', { name: 'Create category' }).click();
  await expect(page.getByText('Category created.')).toBeVisible();

  const amountInput = page.getByRole('textbox', { name: 'Amount' });
  await amountInput.fill('12+3');
  await page.getByRole('button', { name: '=' }).click();
  await expect(amountInput).toHaveValue('15.0000');
  await page.getByLabel('Note').fill('E2E lunch');
  await page.getByRole('button', { name: 'Save entry' }).click();
  await expect(page.getByText('Entry created.')).toBeVisible();
  await expect(page.getByText('E2E lunch')).toBeVisible();

  await page.getByLabel('Edit E2E lunch').click();
  await page.getByLabel('Note').fill('E2E dinner');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Entry updated.')).toBeVisible();
  await expect(page.getByText('E2E dinner')).toBeVisible();

  await page.getByLabel('Soft delete E2E dinner').click();
  await expect(page.getByText('Entry deleted.')).toBeVisible();
  await expect(page.getByText('E2E dinner')).toHaveCount(0);
});
