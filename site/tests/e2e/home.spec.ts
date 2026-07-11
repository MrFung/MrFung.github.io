import { expect, test } from '@playwright/test';

test('localized home shows one fixed-copy language', async ({ page }) => {
  await page.goto('/ja/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.getByRole('heading', { name: 'MrFung' })).toBeVisible();
  await expect(page.getByText('フルスタック開発者、AICoding 実践者', { exact: false })).toBeVisible();
  await expect(page.getByText('全栈开发者，AICoding 实践者', { exact: false })).toHaveCount(0);
});

test('language switch persists selection and enables RTL', async ({ page }) => {
  await page.goto('/ja/about/');
  await page.getByLabel('言語').selectOption('ar');

  await expect(page).toHaveURL('/ar/about/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.evaluate(() => localStorage.getItem('mrfung.siteLanguage'))).resolves.toBe('ar');
});

test('article keeps authored bilingual copy in a French shell', async ({ page }) => {
  await page.goto('/fr/writing/self-introduction/');

  await expect(page.getByRole('navigation').getByText('À propos')).toBeVisible();
  await expect(page.getByText('把真实工作流做成能长期维护的工具。')).toBeVisible();
  await expect(page.getByText('Building tools that can stay useful.')).toBeVisible();
});

test('legacy URL follows browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'de-DE' });
  const page = await context.newPage();
  await page.goto('/billloopr/privacy/');

  await expect(page).toHaveURL('/de/billloopr/privacy/');
  await expect(page.getByRole('heading', { name: 'Datenschutzrichtlinie' })).toBeVisible();
  await context.close();
});

test('localized privacy publishes alternate language links', async ({ page }) => {
  await page.goto('/de/billloopr/privacy/');

  await expect(page.locator('link[hreflang="ja"]')).toHaveAttribute('href', /\/ja\/billloopr\/privacy\/$/);
  await expect(page.getByText('In der App gespeicherte Daten')).toBeVisible();
  await expect(page.getByText('应用内存储的信息')).toHaveCount(0);
});
