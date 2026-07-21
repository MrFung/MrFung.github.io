import { expect, test } from '@playwright/test';

const locales = [
  'en',
  'zh-Hans',
  'zh-Hant',
  'ja',
  'ko',
  'es',
  'fr',
  'de',
  'pt-BR',
  'it',
  'ru',
  'ar',
];
const articlePath = '/writing/kmp-three-platform-performance/';

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

for (const locale of locales) {
  test(`${locale} shell keeps the Chinese KMP original`, async ({ page }) => {
    await page.goto(`/${locale}${articlePath}`);

    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('article[lang="zh-Hans"]')).toContainText(
      '一份 Core，三种高频边界'
    );
  });
}

test('home and writing index publish the KMP article', async ({ page }) => {
  await page.goto('/zh-Hans/');
  const homeCard = page.locator('.article-card').filter({
    hasText: 'Kotlin Multiplatform 三端高频数据 Core',
  });
  await expect(homeCard).toBeVisible();
  await expect(homeCard.getByRole('link')).toHaveAttribute('href',
    '/zh-Hans/writing/kmp-three-platform-performance/'
  );

  await page.goto('/zh-Hans/writing/');
  const writingCard = page.locator('.article-card').filter({
    hasText: 'Kotlin Multiplatform 三端高频数据 Core',
  });
  await expect(writingCard).toBeVisible();
  await expect(writingCard.getByRole('link')).toHaveAttribute('href',
    '/zh-Hans/writing/kmp-three-platform-performance/'
  );
});

test('sitemap and feeds publish the KMP article', async ({ page }) => {
  const sitemap = await (await page.request.get('/sitemap.txt')).text();
  const rss = await (await page.request.get('/rss.xml')).text();
  const atom = await (await page.request.get('/atom.xml')).text();

  expect(sitemap).toContain('/ar/writing/kmp-three-platform-performance/');
  expect(sitemap).toContain('/zh-Hans/writing/kmp-three-platform-performance/');
  expect(rss).toContain('/zh-Hans/writing/kmp-three-platform-performance/');
  expect(atom).toContain('/zh-Hans/writing/kmp-three-platform-performance/');
});
