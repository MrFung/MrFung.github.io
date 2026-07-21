import { expect, test } from '@playwright/test';

test('KMP whitepaper renders verified charts and public technical copy', async ({ page }) => {
  await page.goto('/writing/kmp-three-platform-performance/');

  await expect(
    page.getByRole('heading', {
      name: /Kotlin Multiplatform 三端高频数据 Core/,
    })
  ).toBeVisible();
  await expect(page.locator('article[lang="zh-Hans"]')).toBeVisible();
  await expect(page.locator('[data-performance-chart]')).toHaveCount(8);
  await expect(page.locator('[data-metric="harmony-cpf-peak"]')).toHaveText(
    '83.39 MiB'
  );
  await expect(page.getByText('一份 Core，三种高频边界')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(
    /自选股|债券|iFinD|IFM-[0-9]+|ifind_git/
  );
});

test('KMP whitepaper has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/writing/kmp-three-platform-performance/');

  await expect(
    page.getByRole('heading', {
      name: /Kotlin Multiplatform 三端高频数据 Core/,
    })
  ).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
