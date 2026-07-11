import { expect, test } from '@playwright/test';

test('home page exposes stable primary sections', async ({ page }) => {
  await page.goto('/');

  const primaryNavigation = page.getByLabel('Primary navigation');

  await expect(page.getByRole('heading', { name: 'MrFung' })).toBeVisible();
  await expect(primaryNavigation.getByRole('link', { name: '应用 / Apps' })).toBeVisible();
  await expect(primaryNavigation.getByRole('link', { name: '文章 / Writing' })).toBeVisible();
  await expect(primaryNavigation.getByRole('link', { name: '关于 / About' })).toBeVisible();
});
